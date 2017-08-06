import Ember from 'ember';
import { default as _capitalize } from '../utils/capitalize';

export function capitalize(params) {
  return _capitalize(params[0]);
}

export default Ember.Helper.helper(capitalize);
