import Ember from 'ember';
import fuelTypes from '../utils/fuel-types';

export default Ember.Component.extend({

  /**
   * Services
   */

  carto: Ember.inject.service(),
  colorManager: Ember.inject.service(),


  /**
   * Members
   */

  criteria: null,

  municipality: null,
  municipalities: [],
  municipalityList: [],

  comparisonLimit: 4,
  comparisonList: [],

  chartData: [],



  /**
   * Methods
   */

  init() {
    this._super(...arguments);

    this.set('comparisonList', []);
    this.updateCharts();

    /**
     * This list is used by the spider chart layout to populate
     * a list of possible municipalities to compare our current
     * municipality to. Therefore, we don't want to have our 
     * current municipality in that list. 
     */
    const municipalities = this.get('municipalities')
                               .filter(municipality => municipality !== this.get('municipality'))
                               .sort();

    this.set('municipalityList', Ember.copy(municipalities, true));
  },


  updateCharts() {
    const data = this.get('data');
    console.log(data);

    const beingViewed = [this.get('municipality')].concat(this.get('comparisonList'));

    let munged = data.rows.map(row => {
      row.criterion = row[this.get('criteria')];
      row.color = this.get('colorManager').colorFor(row.municipal, beingViewed);

      row.totalConsumption = 0;
      fuelTypes.forEach(type => row.totalConsumption += row[`${type}_con_mmbtu`]);

      return row;
    });

    this.set('chartData', munged);
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
        this.get('municipalityList').removeObject(municipality);

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
      
      const colorManager = this.get('colorManager');
      let municipalities = this.get('municipalitiesList');
      let data = this.get('data');

      // Put the municipality back in the dropdown
      municipalities.push(municipality);
      this.set('municipalitiesList', Ember.copy(municipalities.sort(), true));

      // Put the assinged color back in the color pool
      colorManager.resetColorFor(municipality);

      // Remove the municipality from our dataset
      data.rows = data.rows.filter(row => row.municipal !== municipality);
      this.set('data', data);

      this.updateCharts();
    }
  
  }

});
