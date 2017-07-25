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
    const displayedMunis = [this.get('municipality')].concat(this.get('comparisonList'));
    const fuelTypes = ['elec', 'ng', 'foil'];
    
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

        this.$('.selection-box select')[0].selectedIndex = 0;
        this.get('municipalities').removeObject(municipality);

        this.get('carto')
            .query(`SELECT * FROM leap_dashboard_commercial WHERE municipal = '${municipality}'`)
            .then(response => {
        
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
      municipalities.push(municipality);
      this.set('municipalities', Ember.copy(municipalities.sort(), true));

      let data = this.get('data');
      data.rows = data.rows.filter(row => row.municipal !== municipality);
      this.set('data', data);

      this.updateCharts();
    }
  
  }

});
