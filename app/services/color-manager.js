import Ember from 'ember';

export default Ember.Service.extend({

  /**
   * Members
   */

  colors: {
    lightPurple: '#9176e3',
    deepPurple: '#2c1784',
    orange: '#f7b045',
    lightBlue: '#11cfff',
    blue: '#1D74F2',
    lightGreen: '#13e3bc',
  },

  colorPool: Ember.computed('colors', function() {
    return Object.values(this.get('colors'));
  }),

  assignedColors: {},


  /**
   * Methods
   */

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
