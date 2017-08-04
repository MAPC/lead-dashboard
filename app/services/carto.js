import Ember from 'ember';
import slug from '../utils/slug';

export default Ember.Service.extend({

  /**
   * Services
   */

  ajax: Ember.inject.service(),


  /**
   * Methods
   */

  /**
   * @param String queryString
   *
   * @return AjaxResponseObject
   */
  query(queryString) {
    const cartoURL = 'https://mapc-admin.carto.com/api/v2/sql?format=json&q=';
    let cleanQueryString = queryString.split(" ").join("%20")
                                      .split("‘").join("%27");

    return this.get('ajax').request(`${cartoURL}${cleanQueryString}`);
  },


  allSectorDataFor(_municipality) {
    const sectors = ['commercial', 'residential', 'industrial'];
    const data = {};

    const municipality = slug(_municipality).denormalize();

    sectors.forEach(sector => {
      data[sector] = this.query(`SELECT * FROM led_${sector} WHERE municipal = '${municipality}'`);
    });

    return {sectorData: data, municipality: municipality};
 
  }

});
