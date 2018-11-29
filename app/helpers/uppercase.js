import { helper } from '@ember/component/helper';

export function uppercase(params) {
  return params[0] ? params[0].toUpperCase() : params[0];
}

export default helper(uppercase);
