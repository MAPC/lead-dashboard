import Ember from 'ember';

export default Ember.Controller.extend({

  /**
   * Members
   */

  municipality: Ember.computed('model', function() {
    return this.get('model').municipality;
  }),

});
