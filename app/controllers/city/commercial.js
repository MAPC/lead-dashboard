import Ember from 'ember';

export default Ember.Controller.extend({

  /**
   * Controllers
   */

  city: Ember.inject.controller(),


  /**
   * Members
   */

  criteriaColumn: 'activity',

  municipality: Ember.computed('city', function() {
    return this.get('city').get('municipality');
  }),

  criteria: Ember.computed('model', function() {
    return this.get('model').rows.map(row => row[this.get('criteriaColumn')]);
  })

});
