import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';

import slug from '../utils/slug';


export default class extends Controller {

  /**
   * Services
   */

  @service municipalityList;
  @service router;


  /**
   * Members
   */

  municipalities = [];
  placeholder = 'How much energy does your community consume?';

  year = (new Date()).getFullYear();


  /**
   * Methods
   */

  constructor() {
    super();

    this.get('municipalityList').listFor().then(response => {
      const municipalities = response.rows.map(row => row.municipal).sort();

      municipalities.unshift(this.get('placeholder'));

      this.set('municipalities', municipalities);
      this.set('placeholder', municipalities[0]);
    });
  }


  @action
  toMunicipality(municipality) {
    this.get('router').transitionTo('city.index', slug(municipality).normalize());
  }


}
