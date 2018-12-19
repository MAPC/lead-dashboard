import Controller from '@ember/controller';
import { copy } from 'ember-copy';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';


export default class extends Controller {

  /**
   * Services
   */

  @service municipalityList;


  /**
   * Members
   */

  sector = 'commercial';
  municipalities = [];
  criteria = [];
  criteriaName = 'Business';
  criteriaColumn = 'activity';


  @computed('model')
  get municipality() {
    return (this.get('model')) ? this.get('model').municipality : '';
  }


  @computed('model')
  get sectorData() {
    return copy(this.get('model').sectorData, true);
  }


  @computed('sectorData', 'municipality')
  get muniSectorData() {
    const municipality = this.get('municipality');
    return this.get('sectorData').rows.filter(row => row.municipal === municipality);
  }


  /**
   * Methods
   */

  constructor() {
    super(...arguments);

    this.get('municipalityList').listFor(this.get('sector')).then(response => {
      this.set('municipalities', response.rows.map(row => row.municipal));
    });
  }

}
