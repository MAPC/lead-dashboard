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

  sector: null,

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

  beingViewed() {
    return  [this.get('municipality')].concat(this.get('comparisonList').map(muni => muni.name));
  },

  updateCharts() {
    const data = this.get('data');
    const beingViewed = this.beingViewed();

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
      const sector = this.get('sector');
      let list = this.get('comparisonList');

      if (list.length < this.get('comparisonLimit')) {
        const colorManager = this.get('colorManager');
        const beingViewed = [municipality].concat(this.get('beingViewed'));

        const municipalColor = colorManager.colorFor(municipality, beingViewed);
        list.pushObject({
          name: municipality, 
          color: municipalColor
        });

        // Remove municipality from the list of options
        this.get('municipalityList').removeObject(municipality);

        // Fetch the data for the selected municipality then add
        this.get('carto')
            .query(`SELECT * FROM led_${sector} WHERE municipal = '${municipality}'`)
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
      let municipalities = this.get('municipalityList');
      let data = this.get('data');

      // Put the municipality back in the dropdown
      municipalities.push(municipality.name);
      this.set('municipalityList', Ember.copy(municipalities.sort(), true));

      // Put the assinged color back in the color pool
      colorManager.resetColorFor(municipality.name);

      // Remove the municipality from our dataset
      data.rows = data.rows.filter(row => row.municipal !== municipality.name);
      this.set('data', data);

      this.updateCharts();
    }
  
  }

});
