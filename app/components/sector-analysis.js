import Ember from 'ember';
import capitalize from '../utils/capitalize';
import maxRowByKey from '../utils/max-row-by-key';
import grammaticList from '../utils/grammatic-list';
import { fuelTypes, fuelTypesMap } from '../utils/fuel-types';

const { computed } = Ember;


export default Ember.Component.extend({

  valueMap: null,


  municipality: computed('data', function() {
    return this.get('data')[0].municipal;
  }),


  topConsuming: computed('data', 'municipality', function() {
    const data = Ember.copy(this.get('data'), true);

    const topCount = Math.min(3, data.length - 1);
    const topConsumers = [];
    
    while (topConsumers.length < topCount) {
      var { row, index } = maxRowByKey(data, 'total_con_mmbtu');

      topConsumers.push(row);
      data.splice(index, 1);
    }

    return topConsumers;
  }),


  topConsumingPercentage: computed('topConsuming', 'data', function() {
    const topConsumers = Ember.copy(this.get('topConsuming'), true);
    const data =  Ember.copy(this.get('data'), true);

    const total = data.reduce((a, row) => a += row.total_con_mmbtu, 0);
    const topTotal = topConsumers.reduce((a, row) => a += row.total_con_mmbtu, 0);

    return this.roundedPercentage(topTotal, total);
  }),


  topConsumingNames: computed('topConsuming', 'criteriaColumn', function() {
    const topConsuming = this.get('topConsuming');
    const criteriaColumn = this.get('criteriaColumn');
    const valueMap = this.get('valueMap');

    const topConsumingNames = topConsuming.map(consumer => capitalize(consumer[criteriaColumn]));

    return (valueMap) ? topConsumingNames.map(name => valueMap[name.toLowerCase()]) : topConsumingNames;
  }),


  topConsumingName: computed('topConsumingNames', function() {
    return this.get('topConsumingNames')[0].trim();
  }),


  topConsumingString: computed('topConsumingNames', function() {
    const topConsumers = Ember.copy(this.get('topConsumingNames'));
    const gList = grammaticList(topConsumers);
    
    return gList + ((topConsumers.length > 1) ? ' together make ' : ' makes ');
  }),


  topFuel: computed('data', function() {    
    const data = Ember.copy(this.get('data'), true);

    const fuelTotals = fuelTypes.map(_type => {
                          return {
                            type: _type,
                            value: data.reduce((a,b) => a += b[`${_type}_con_mmbtu`], 0)
                          };
                        })
                        .reduce((a, _typeSet) => {
                          a[_typeSet.type] = _typeSet.value;
                          return a;
                        }, {});

    const topFuelKey = Object.keys(fuelTotals).reduce((a,b) => fuelTotals[a] > fuelTotals[b] ? a : b);

    return fuelTypesMap[topFuelKey].toLowerCase();
  }),


  otherFuels: computed('topFuel', function() {
    const topFuel = this.get('topFuel');
    const otherFuels = fuelTypes.filter(type => fuelTypesMap[type].toLowerCase() !== topFuel)
                                .map(fuel => fuelTypesMap[fuel].toLowerCase());

    return grammaticList(otherFuels, {conjunction: 'or'});
  }),


  topEmissions: computed('data', 'criteriaColumn', function() {
    const data = Ember.copy(this.get('data'), true);

    const totalEmissions = data.map(row => {
      return {
        name: row[this.get('criteriaColumn')],
        emissions: fuelTypes.reduce((a, type) => a += row[`${type}_emissions_co2`], 0)
      };
    });

    return maxRowByKey(totalEmissions, 'emissions').row;
  }),


  topEmissionsName: computed('topEmissions', 'valueMap', function() {
    const valueMap = this.get('valueMap');
    const topEmissions = this.get('topEmissions');

    return (valueMap) ? valueMap[topEmissions.name] : topEmissions.name;
  }),


  topEmissionsPercentage: computed('topEmissions', 'data', function() {
    const data = Ember.copy(this.get('data'), true);
    const topEmissions = this.get('topEmissions');

    const total = data.reduce((a,b) => a += fuelTypes.reduce((a, type) => a += b[`${type}_emissions_co2`], 0), 0);

    return this.roundedPercentage(topEmissions.emissions, total);
  }),


  roundedPercentage(numerator, denominator) {
    return Math.round(((numerator * 10000) / denominator)) / 100;
  },

});
