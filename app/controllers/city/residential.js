import Ember from 'ember';

export default Ember.Controller.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  sector: 'residential',
  criteriaColumn: 'municipal',

  municipalities: [],

  municipality: Ember.computed('model', function() {
    return (this.get('model')) ? this.get('model').municipality : '';
  }),

  sectorData: Ember.computed('model', function() {
    return this.get('model').sectorData;
  }),

  criteria: Ember.computed('sectorData', function() {
    const hu_type_map = {
      'u1': 'Single-family Homes',
      'u2_4': 'Apartments in 2-4 Unit Buildings',
      'u5ov': 'Apartments in 5 or More Unit Buildings',
      'u_oth': 'Mobile Homes',
    };

    const filteredRows = this.get('sectorData').rows.filter(row => row.hu_type !== 'total');
    return filteredRows.map(row => hu_type_map[row.hu_type]);
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
