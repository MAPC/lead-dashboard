import Ember from 'ember';

const { computed } = Ember;


export default Ember.Component.extend({

  noSectorData: computed('muniSectorData', function() {
    return !(this.get('muniSectorData').length);
  }),

});
