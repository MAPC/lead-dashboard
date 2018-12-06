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


  offset(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
  }

}
