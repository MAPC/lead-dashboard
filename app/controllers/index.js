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
  placeholder: 'Discover how much energy your town is using',

  year: (new Date()).getFullYear(),


  /**
   * Methods
   */

  init() {
    this._super();

    this.get('municipalityList').listFor().then(response => {
      const municipalities = response.rows.map(row => row.municipal)
                                          .sort();

      municipalities.unshift(this.get('placeholder'));

      this.set('municipalities', municipalities);
      this.set('placeholder', municipalities[0]);
    });
  },

  actions: {

    toMunicipality(municipality) {
      this.transitionToRoute('city.index', municipality);
    },

    clickSelector() {
      const elem = Ember.$('#municipal-selector');
      elem.focus().mousedown();
    }
  
  }

});
