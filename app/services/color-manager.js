import Service from '@ember/service';
import { computed } from '@ember-decorators/object';


export default class extends Service {

  /**
   * Members
   */

  colors = {
    lightPurple: '#9176e3',
    poiple: '#51498c',
    lightBlue: '#11cfff',
    red: '#f44b36',
    pink: '#f43673',
    blue: '#1D74F2',
    lightGreen: '#13e3bc',
    orellow: '#f4af5a',
  };

  @computed('colors')
  get colorPool() {
    return Object.values(this.get('colors'));
  }

  assignedColors = {};

  cached = {
    viewed: null,
  };


  /**
   * Methods
   */

  colorFor(municipality, viewed) {
    const cached = this.get('cached');

    if (viewed) {
      cached.viewed = viewed;
      this.set('cached', cached);
    }
    else {
      viewed = cached.viewed;
    }

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
  }


  resetColorFor(municipality) {
    const assignedColors = this.get('assignedColors');
    this.get('colorPool').pushObject(assignedColors[municipality]);
  }


  offset(color, offset) {
    return color;
  }

}
