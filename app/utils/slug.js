import capitalize from './capitalize';

export default function slug(value) {

  return {
    normalize() {
      return (value || '').toLowerCase().split(' ').join('-');
    },

    denormalize() {
      return (value || '').split('-').map(capitalize).join(' ');
    }
  };

}
