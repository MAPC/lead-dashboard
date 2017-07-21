import Ember from 'ember';

export default Ember.Controller.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  municipalities: [],


  /**
   * Methods
   */

  init() {
    this._super();

    this.get('municipalityList').listFor().then(response => {
      const municipalities = response.rows.map(row => row.municipal);
      this.set('municipalities', municipalities.sort());
    });
  },

  actions: {

    toMunicipality(municipality) {
      this.transitionToRoute('city.index', municipality);
    }
  
  }

});
