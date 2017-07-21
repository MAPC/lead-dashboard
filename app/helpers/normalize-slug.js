import Ember from 'ember';
import slug from '../utils/slug';

export function normalizeSlug(params) {
  return slug(params[0]).normalize();
}

export default Ember.Helper.helper(normalizeSlug);
