import Ember from 'ember';

export default Ember.Service.extend({

  colorPool: ['#F7A4AC', '#AA6067', '#6FA7C4', '#6994AA', '#F8F6BE'],
  assignedColors: {},

  colorFor(municipality, viewed = []) {
    const colors = this.get('assignedColors');
    const colorPool = this.get('colorPool');

    if (viewed.indexOf(municipality) === -1 && colors[municipality]) {
      if (colorPool.indexOf(colors[municipality]) === -1) {
        delete colors[municipality];
      }
    }
    
    if (!colors[municipality]) {
      const color = colorPool[Math.floor(Math.random() * colorPool.length)];
      colorPool.removeObject(color);
      colors[municipality] = color;
    }

    return colors[municipality];
  },

  resetColorFor(municipality) {
    const assignedColors = this.get('assignedColors');
    this.get('colorPool').pushObject(assignedColors[municipality]);
  }

});
