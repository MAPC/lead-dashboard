import Ember from 'ember';

export default Ember.Service.extend({

  /**
   * Services
   */

  carto: Ember.inject.service(),


  /**
   * Members
   */

  cachedLists: {},


  /**
   * Methods
   */

  /**
   * @param String sector
   * 
   * @return AjaxResponseObject
   */
  listFor(sector = 'commercial') {
    const cachedLists = this.get('cachedLists');
    const carto = this.get('carto');

    let list = null;
    if (cachedLists[sector] !== undefined) {
      list = cachedLists[sector];
    }
    else {
      list = carto.query(`SELECT DISTINCT municipal FROM led_${sector}`);
      cachedLists[sector] = list;
    }

    return list;
  }

});
