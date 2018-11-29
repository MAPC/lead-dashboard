import Service from '@ember/service';
import { service } from '@ember-decorators/service';


export default class extends Service {

  /**
   * Services
   */

  @service carto


  /**
   * Members
   */

  cachedLists = {}


  /**
   * Methods
   */

  listFor(sector = 'commercial') {
    const cachedLists = this.get('cachedLists');
    const carto = this.get('carto');

    let list = null;
    if (cachedLists[sector] !== undefined) {
      list = cachedLists[sector];
    }
    else {
      list = carto.query(`SELECT DISTINCT municipal FROM lead_${sector}`);
      cachedLists[sector] = list;
    }

    return list;
  }
}
