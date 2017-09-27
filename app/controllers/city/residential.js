import Ember from 'ember';
import { huTypeMap } from '../../utils/maps';
import fuelTypes from  '../../utils/fuel-types';

const { computed } = Ember;

export default Ember.Controller.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  sector: 'residential',
  municipalities: [],

  criteriaName: 'Building',
  criteriaColumn: 'hu_type',
  valueMap: huTypeMap,


  municipality: computed('model', function() {
    return (this.get('model')) ? this.get('model').municipality : '';
  }),


  sectorData: computed('model', function() {
    return Ember.copy(this.get('model').sectorData, true);
  }),


  muniSectorData: computed('municipality', 'sectorData', function() {
    const municipality = this.get('municipality');
    return this.get('sectorData').rows.filter(row => row.municipal === municipality && row.hu_type !== 'total');
  }),


  criteria: computed('muniSectorData', function() {
    const sectorData = this.get('muniSectorData');

    const filteredRows = sectorData.filter(row => {
      return row.hu_type !== 'total' && !fuelTypes.every(type => row[`${type}_con_mmbtu`] === 0 || row[`${type}_con_mmbtu`] === null);
    });

    return filteredRows.map(row => huTypeMap[row.hu_type]);
  }),


  /**
   * Methods
   */

  init() {
    this._super(...arguments);
  
    this.get('municipalityList').listFor(this.get('sector')).then(response => {
      this.set('municipalities', response.rows.map(row => row.municipal));
    });
  }

});
