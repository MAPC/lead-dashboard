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

  criteriaColumn: null,

  municipality: null,
  municipalities: [],

  comparisonLimit: 4,
  comparisonList: [],

  consumptionData: {},
  emissionsData: {},
  costData: {},


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
 
    // Munge data into separate datasets
    const data = this.get('data');
    const criteria = this.get('criteriaColumn');
    const fuelTypes = ['elec', 'ng', 'foil'];
    
    /**
     * This map has the dataset type associated with the
     * column to lookup for composing that particular
     * dataset.
     */
    const datasets = {
      'consumptionData': 'con_mmbtu',
      'emissionsData': 'emissions',
      'costData': 'exp_dol_mmbtu',
    };

    for (let datasetTitle in datasets) {
      let column = datasets[datasetTitle];

      let dataset = data.rows.map(row => {
        let datum = {municipal: row.municipal, criterion: row[criteria]};
        fuelTypes.forEach(type => datum[type] = row[`${type}_${column}`]);

        return datum;
      });
     
      this.set(datasetTitle, dataset);
    }
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
      
      // Put the municipality back in the dropdown
      let municipalities = this.get('municipalities');
      municipalities.push(municipality);
      this.set('municipalities', Ember.copy(municipalities.sort(), true));

      // Remove the municipality from our dataset
      let data = this.get('data');
      data.rows = data.rows.filter(row => row.municipal !== municipality);
      this.set('data', data);

      this.updateCharts();
    }
  
  }

});
