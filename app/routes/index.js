import Ember from 'ember';
const cities = ['Worcester', 'Boston', 'Cambridge', 'Somerville'];

export default Ember.Route.extend({
  model() {
    return cities;
  }
});
