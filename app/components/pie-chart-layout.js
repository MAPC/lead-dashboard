import Ember from 'ember';

export default Ember.Component.extend({

  init() {
    this._super();
    console.log(this.get('data'));
  }

});
