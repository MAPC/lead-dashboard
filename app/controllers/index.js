import Ember from 'ember';
import slug from '../utils/slug';

export default Ember.Controller.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  municipalities: [],
  placeholder: 'Discover how much energy your municipality is using',

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
      this.transitionToRoute('city.index', slug(municipality).normalize());
    },
  
  }

});
