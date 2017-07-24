import Ember from 'ember';

export default Ember.Component.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

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
    this._super();

    this.get('municipalityList').listFor(this.get('sector')).then(response => {

      const municipalities = response.rows.map(row => row.municipal)
                                          .filter(municipality => municipality !== this.get('municipality'))
                                          .sort();

      this.set('municipalities', municipalities);
    });
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
    }
  
  }

});
