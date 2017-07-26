import Ember from 'ember';

export default Ember.Component.extend({

  /**
   * Services
   */

  carto: Ember.inject.service(),
  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  criteria: null,
  colorPool: ['#F7A4AC', '#AA6067', '#6FA7C4', '#6994AA', '#F8F6BE'],
  assignedColors: {},

  municipality: null,
  municipalities: [],

  comparisonLimit: 4,
  comparisonList: [],

  comparisonData: [],


  /**
   * Methods
   */

  init() {
    this._super(...arguments);

    // Fetch municipalities
    this.get('municipalityList').listFor(this.get('sector')).then(response => {

      /**
       * This list is used by the spider chart layout to populate
       * a list of possible municipalities to compare our current
       * municipality to. Therefore, we don't want to have our 
       * current municipality in that list. 
       */
      const municipalities = response.rows.map(row => row.municipal)
                                          .filter(municipality => municipality !== this.get('municipality'))
                                          .sort();

      this.set('municipalities', municipalities);
    });

    this.updateCharts();
  },


  updateCharts() {
 
    const data = this.get('data');
    const fuelTypes = ['elec', 'ng', 'foil'];

    let munged = data.rows.map(row => {
      row.criterion = row[this.get('criteria')];
      row.color = this.assignColor(row.municipal);

      row.totalConsumption = 0;
      fuelTypes.forEach(type => row.totalConsumption += row[`${type}_con_mmbtu`]);

      return row;
    });

    this.set('chartData', munged);
  },


  assignColor(municipality) {
    const colors = this.get('assignedColors');
    const colorPool = this.get('colorPool');

    const beingViewed = [this.get('municipality')].concat(this.get('comparisonList'));

    if (beingViewed.indexOf(municipality) === -1 && colors[municipality]) {
      if (colorPool.indexOf(colors[municipality]) === -1) {
        delete colors[municipality];
      }
    }
    
    if (!colors[municipality]) {
      let color = colorPool[Math.floor(Math.random() * colorPool.length)];
      colorPool.removeObject(color);
      colors[municipality] = color;
    }

    return colors[municipality];
  },


  actions: {

    /**
     * @param String municipality 
     */
    addToComparisonList(municipality) {
      let list = this.get('comparisonList');

      if (list.length < this.get('comparisonLimit')) {
        list.pushObject(municipality);

        // Reselect our default value and remove municipality from dataset
        this.$('.selection-box select')[0].selectedIndex = 0;
        this.get('municipalities').removeObject(municipality);

        // Fetch the data for the selected municipality then add
        this.get('carto')
            .query(`SELECT * FROM leap_dashboard_commercial WHERE municipal = '${municipality}'`)
            .then(response => {
        
              // In order to have Ember components rerender properly, we must
              // add the rows one at a time
              response.rows.forEach(row => {
                this.get('data').rows.pushObject(row);
              });

              this.updateCharts();
        });

      }
    },


    /**
     * @param String municipality
     */
    removeFromComparisonList(municipality) {
      this.get('comparisonList').removeObject(municipality);
      
      let municipalities = this.get('municipalities');
      let assignedColors = this.get('assignedColors');
      let data = this.get('data');

      // Put the municipality back in the dropdown
      municipalities.push(municipality);
      this.set('municipalities', Ember.copy(municipalities.sort(), true));

      // Put the assinged color back in the color pool
      this.get('colorPool').pushObject(assignedColors[municipality]);

      // Remove the municipality from our dataset
      data.rows = data.rows.filter(row => row.municipal !== municipality);
      this.set('data', data);

      this.updateCharts();
    }
  
  }

});
