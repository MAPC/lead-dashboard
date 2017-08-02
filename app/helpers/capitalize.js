import Ember from 'ember';

export function capitalize(params) {
  const word = params[0];

  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default Ember.Helper.helper(capitalize);
