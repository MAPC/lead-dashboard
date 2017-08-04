import Ember from 'ember';

export function uppercase(params) {
  if (params[0]) {
    return params[0].toUpperCase();
  }
  else {
    return params[0];
  }
}

export default Ember.Helper.helper(uppercase);
