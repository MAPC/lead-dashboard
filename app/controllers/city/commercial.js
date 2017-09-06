import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  sector: 'commercial',
  municipalities: [],

  criteria: [],
  criteriaName: 'Business',
  criteriaColumn: 'activity',


  municipality: computed('model', function() {
    return (this.get('model')) ? this.get('model').municipality : '';
  }),


  sectorData: computed('model', function() {
    return Ember.copy(this.get('model').sectorData, true);
  }),


  muniSectorData: computed('sectorData', 'municipality', function() {
    const municipality = this.get('municipality');
    return this.get('sectorData').rows.filter(row => row.municipal === municipality);
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
