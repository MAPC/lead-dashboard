import { helper } from '@ember/component/helper';
import { default as _capitalize } from '../utils/capitalize';

export function capitalize(params) {
  return _capitalize(params[0]);
}

export default helper(capitalize);
