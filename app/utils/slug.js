export default function slug(value) {

  return {
    normalize() {
      return value.toLowerCase().split(' ').join('-');
    },

    denormalize() {
      return value.split('-').map(_capitalize).join(' ');
    }
  };


  /**
   * @private
   */

  function _capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
