import Ember from 'ember';

export default Ember.Controller.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  sector: 'commercial',
  criteriaColumn: 'activity',

  municipalities: [],

  municipality: Ember.computed('model', function() {
    return (this.get('model')) ? this.get('model').municipality : '';
  }),

  sectorData: Ember.computed('model', function() {
    return this.get('model').sectorData;
  }),

  criteria: Ember.computed('sectorData', function() {
    return this.get('sectorData').rows.map(row => row[this.get('criteriaColumn')]);
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
