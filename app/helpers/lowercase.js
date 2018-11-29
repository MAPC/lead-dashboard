import { helper } from '@ember/component/helper';

export function lowercase(params) {
  return params[0].toLowerCase();
}

export default helper(lowercase);
