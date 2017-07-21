import Ember from 'ember';

export function formatSlug(params) {
  return params[0].toLowerCase().replace(' ', '-');
}

export default Ember.Helper.helper(formatSlug);
