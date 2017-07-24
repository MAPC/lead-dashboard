import Ember from 'ember';

export default Ember.Controller.extend({

  /**
   * Controllers
   */

  city: Ember.inject.controller(),


  /**
   * Members
   */

  municipality: Ember.computed('city', function() {
    return this.get('city').get('municipality');
  }),

  criteria: Ember.computed('model', function() {
    const hu_type_map = {
      'u1': 'Single-family Homes',
      'u2_4': 'Apartments in 2-4 Unit Buildings',
      'u5ov': 'Apartments in 5 or More Unit Buildings',
      'u_oth': 'Mobile Homes',
    };

    const filteredRows = this.get('model').rows.filter(row => row.hu_type !== 'total');
    return filteredRows.map(row => hu_type_map[row.hu_type]);
  })

});
