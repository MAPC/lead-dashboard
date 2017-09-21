import Ember from 'ember';
import { default as _acronyze } from '../utils/acronyze';

export function acronyze(params) {
  return _acronyze(params[0]);
}

export default Ember.Helper.helper(acronyze);
