import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import config from 'lead-dashboard/config/environment';

import slug from '../utils/slug';


export default class extends Service {

  /**
   * Services
   */

  @service ajax;


  /**
   * Members
   */

  cache = {};


  /**
   * Methods
   */

  query(queryString) {
    const cache = this.get('cache');
    const cartoURL = `https://prql.mapc.org?token=${config.prqlToken}&query=`;

    if (Object.keys(cache).indexOf(queryString) !== -1) {
      return cache[queryString];
    }
    else {
      const cleanQueryString = encodeURIComponent(queryString);

      let response = this.get('ajax').request(`${cartoURL}${cleanQueryString}`);
      cache[queryString] = response;

      return response;
    }
  }


  allSectorDataFor(_municipality) {
    const sectors = ['commercial', 'residential', 'industrial'];
    const data = {};

    const municipality = slug(_municipality).denormalize();

    sectors.forEach(sector => {
      data[sector] = this.query(`SELECT * FROM tabular.mapc_lead_${sector} WHERE municipal ILIKE '${municipality}'`);
    });

    return {sectorData: data, municipality: municipality};
  }


  populationFor(_municipality, year = 2015) {
    const municipality = slug(_municipality).denormalize();

    return this.query(`SELECT pop_est, years FROM tabular.demo_pop_estimates_m WHERE municipal ILIKE '${municipality}' AND years = '${year}'`);
  }

}
