import Controller from '@ember/controller';
import { copy } from '@ember/object/internals';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';

import { huTypeMap } from '../../utils/maps';
import fuelTypes from  '../../utils/fuel-types';


export default class extends Controller {

  /**
   * Services
   */

  @service municipalityList;


  /**
   * Members
   */

  sector = 'residential';
  municipalities = [];

  criteriaName = 'Building';
  criteriaColumn =  'hu_type';
  valueMap = huTypeMap;


  @computed('model')
  get municipality() {
    return (this.get('model')) ? this.get('model').municipality : '';
  }


  @computed('model')
  get sectorData() {
    return copy(this.get('model').sectorData, true);
  }


  @computed('municipality', 'sectorData')
  get muniSectorData() {
    const municipality = this.get('municipality');
    return this.get('sectorData').rows.filter(row => row.municipal === municipality && row.hu_type !== 'total');
  }


  @computed('muniSectorData')
  get criteria() {
    const sectorData = this.get('muniSectorData');

    const filteredRows = sectorData.filter(row => {
      return row.hu_type !== 'total' && !fuelTypes.every(type => row[`${type}_con_mmbtu`] === 0 || row[`${type}_con_mmbtu`] === null);
    });

    return filteredRows.map(row => huTypeMap[row.hu_type]);
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
