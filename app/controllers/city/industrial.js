import Ember from 'ember';

export default Ember.Controller.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  sector: 'industrial',
  criteriaColumn: 'naicstitle',
  criteria: [],

  municipalities: [],

  municipality: Ember.computed('model', function() {
    return (this.get('model')) ? this.get('model').municipality : '';
  }),

  sectorData: Ember.computed('model', function() {
    return Ember.copy(this.get('model').sectorData, true);
  }),


  /**
   * Methods
   */

  init() {
    this._super(...arguments);
  
    this.get('municipalityList').listFor(this.get('sector')).then(response => {
      this.set('municipalities', response.rows.map(row => row.municipal));
    });
  }


});
