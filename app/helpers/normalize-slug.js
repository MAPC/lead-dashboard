import { helper } from '@ember/component/helper';
import slug from '../utils/slug';

export function normalizeSlug(params) {
  return slug(params[0]).normalize();
}

export default helper(normalizeSlug);
