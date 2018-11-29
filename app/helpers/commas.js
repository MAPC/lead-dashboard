import { helper } from '@ember/component/helper';

export function commas(params) {
  return parseInt(params[0]).toLocaleString('en-us');
}

export default helper(commas);
