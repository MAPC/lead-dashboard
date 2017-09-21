import Ember from 'ember';
import slug from '../utils/slug';

export default Ember.Service.extend({

  /**
   * Services
   */

  ajax: Ember.inject.service(),


  /**
   * Members
   */

  cache: {},


  /**
   * Methods
   */

  /**
   * @param String queryString
   *
   * @return AjaxResponseObject
   */
  query(queryString) {
    const cache = this.get('cache');
    const cartoURL = 'https://mapc-admin.carto.com/api/v2/sql?format=json&q=';

    if (Object.keys(cache).indexOf(queryString) !== -1) {
      return cache[queryString];
    }
    else {
      const cleanQueryString = encodeURIComponent(queryString);

      let response = this.get('ajax').request(`${cartoURL}${cleanQueryString}`);
      cache[queryString] = response;

      return response;
    }
  },


  allSectorDataFor(_municipality) {
    const sectors = ['commercial', 'residential', 'industrial'];
    const data = {};

    const municipality = slug(_municipality).denormalize();

    sectors.forEach(sector => {
      data[sector] = this.query(`SELECT * FROM lead_${sector} WHERE municipal = '${municipality}'`);
    });

    return {sectorData: data, municipality: municipality};
  },


  populationFor(_municipality) {
    const municipality = slug(_municipality).denormalize();

    return this.query(`SELECT pop_est, years FROM demo_pop_estimates_m WHERE municipal = '${municipality}' AND years = '2015'`);
  }

});
