import Ember from 'ember';
import { huTypeMap } from '../../utils/maps';
import fuelTypes from  '../../utils/fuel-types';

export default Ember.Controller.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  sector: 'residential',
  criteriaColumn: 'hu_type',
  valueMap: huTypeMap,

  municipalities: [],

  municipality: Ember.computed('model', function() {
    return (this.get('model')) ? this.get('model').municipality : '';
  }),

  sectorData: Ember.computed('model', function() {
    return Ember.copy(this.get('model').sectorData, true);
  }),

  criteria: Ember.computed('sectorData', function() {
    const sectorData = this.get('sectorData');

    const filteredRows = sectorData.rows.filter(row => {
      return row.hu_type !== 'total' && !fuelTypes.every(type => row[`${type}_con_mmbtu`] === 0);
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
