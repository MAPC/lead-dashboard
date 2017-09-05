import Ember from 'ember';
import maxRowByKey from '../../utils/max-row-by-key';
import grammaticList from '../../utils/grammatic-list';
import {fuelTypes, fuelTypesMap } from '../../utils/fuel-types';

const { computed } = Ember;


export default Ember.Controller.extend({

  /**
   * Services
   */

  municipalityList: Ember.inject.service(),


  /**
   * Members
   */

  sector: 'industrial',
  criteriaColumn: 'naicstitle',
  criteria: [],

  municipalities: [],


  municipality: computed('model', function() {
    return (this.get('model')) ? this.get('model').municipality : '';
  }),


  sectorData: computed('model', function() {
    return Ember.copy(this.get('model').sectorData, true);
  }),


  topConsumingIndustries: computed('sectorData', 'municipality', function() {
    const sectorData = this.get('sectorData');
    const municipality = this.get('municipality');

    let muniSectorData = sectorData.rows.filter(row => row.municipal === municipality);

    const topCount = Math.min(3, muniSectorData.length - 1);
    const topConsumers = [];
    
    while (topConsumers.length < topCount) {
      var { row, index } = maxRowByKey(muniSectorData, 'total_con_mmbtu');

      topConsumers.push(row);
      muniSectorData.splice(index, 1);
    }

    return topConsumers;
  }),


  muniSectorData: computed('sectorData', 'municipality', function() {
    const municipality = this.get('municipality');
    return this.get('sectorData').rows.filter(row => row.municipal === municipality);
  }),


  topConsumingNames: computed('topConsumingIndustries', function() {
    return this.get('topConsumingIndustries').map(consumer => consumer.naicstitle);
  }),


  topConsumingPercentage: computed('topConsumingIndustries', 'muniSectorData', function() {
    const topConsumers = Ember.copy(this.get('topConsumingIndustries'), true);
    const muniSectorData =  Ember.copy(this.get('muniSectorData'), true);

    const total = muniSectorData.reduce((a, row) => a += row.total_con_mmbtu, 0);
    const topTotal = topConsumers.reduce((a, row) => a += row.total_con_mmbtu, 0);

    return Math.round(((topTotal * 10000) / total)) / 100;
  }),


  topConsumingIndustriesString: computed('topConsumingNames', function() {
    const topConsumers = Ember.copy(this.get('topConsumingNames'));
    const gList = grammaticList(topConsumers);
    
    return gList + ((topConsumers.length > 1) ? ' together make ' : ' makes ');
  }),


  topConsumingIndustry: computed('topConsumingNames', function() {
    return Ember.copy(this.get('topConsumingNames'))[0];
  }),


  topFuel: computed('sectorData', function() {
    const sectorData = Ember.copy(this.get('sectorData'), true);

    const fuelTotals = this.totalFuelByColumn(sectorData, 'con_mmbtu');
    const topFuelKey = Object.keys(fuelTotals).reduce((a,b) => fuelTotals[a] > fuelTotals[b] ? a : b);

    return fuelTypesMap[topFuelKey].toLowerCase();
  }),


  otherFuels: computed('topFuel', function() {
    const topFuel = this.get('topFuel');
    const otherFuels = fuelTypes.filter(type => fuelTypesMap[type].toLowerCase() !== topFuel)
                                .map(fuel => fuelTypesMap[fuel].toLowerCase());

    return grammaticList(otherFuels, {conjunction: 'or'});
  }),


  topEmissionsIndustry: computed('sectorData', 'municipality', function() {
    const sectorData = Ember.copy(this.get('sectorData'), true);
    const municipality = this.get('municipality');
  
    const muniSectorData = sectorData.rows.filter(row => row.municipal === municipality);

    const totalEmissions = muniSectorData.map(row => {
      return {
        naicstitle: row.naicstitle,
        emissions: fuelTypes.reduce((a, type) => a += row[`${type}_emissions_co2`], 0)
      };
    });

    return maxRowByKey(totalEmissions, 'emissions').row;
  }),


  topEmissionsName: computed('topEmissionsIndustry', function() {
    return this.get('topEmissionsIndustry').naicstitle;
  }),


  topEmissionsPercentage: computed('topEmissionsIndustry', 'muniSectorData', function() {
    const muniSectorData = Ember.copy(this.get('muniSectorData'), true);
    const topEmissionsIndustry = this.get('topEmissionsIndustry');

    const total = muniSectorData.reduce((a,b) => a += fuelTypes.reduce((a, type) => a += b[`${type}_emissions_co2`], 0), 0);

    return Math.round(((topEmissionsIndustry.emissions * 10000) / total)) / 100;
  }),


  totalFuelByColumn(data, columnName) {
     return fuelTypes.map(_type => {
                        return {
                          type: _type,
                          value: data.rows.reduce((a,b) => a += b[`${_type}_${columnName}`], 0)
                        };
                      })
                      .reduce((a, _typeSet) => {
                        a[_typeSet.type] = _typeSet.value;
                        return a;
                      }, {});
  },


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
