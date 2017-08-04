import Ember from 'ember';

export function commas(params) {
  return parseInt(params[0]).toLocaleString('en-us');
}

export default Ember.Helper.helper(commas);
