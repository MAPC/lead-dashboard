import Component from '@ember/component';
import { copy } from 'ember-copy';
import { computed } from '@ember-decorators/object';

import capitalize from '../utils/capitalize';
import maxRowByKey from '../utils/max-row-by-key';
import grammaticList from '../utils/grammatic-list';
import { fuelTypes, fuelTypesMap } from '../utils/fuel-types';


export default class extends Component {

  valueMap = null;


  @computed('data')
  get municipality() {
    return this.get('data')[0].municipal;
  }


  @computed('data', 'municipality')
  get topConsuming() {
    const data = copy(this.get('data'), true);

    const topCount = Math.min(3, data.length - 1);
    const topConsumers = [];

    while (topConsumers.length < topCount) {
      var { row, index } = maxRowByKey(data, 'total_con_mmbtu');

      topConsumers.push(row);
      data.splice(index, 1);
    }

    return topConsumers;
  }


  @computed('data', 'topConsuming')
  get topConsumingPercentage() {
    const topConsumers = copy(this.get('topConsuming'), true);
    const data =  copy(this.get('data'), true);

    const total = data.reduce((a, row) => a += row.total_con_mmbtu, 0);
    const topTotal = topConsumers.reduce((a, row) => a += row.total_con_mmbtu, 0);

    return this.roundedPercentage(topTotal, total);
  }


  @computed('topConsuming', 'criteriaColumn')
  get topConsumingNames() {
    const topConsuming = this.get('topConsuming');
    const criteriaColumn = this.get('criteriaColumn');
    const valueMap = this.get('valueMap');

    const topConsumingNames = topConsuming.map(consumer => capitalize(consumer[criteriaColumn]));

    return (valueMap) ? topConsumingNames.map(name => valueMap[name.toLowerCase()]) : topConsumingNames;
  }


  @computed('topConsumingNames')
  get topConsumingName() {
    return this.get('topConsumingNames')[0].trim();
  }


  @computed('topConsumingNames')
  get topConsumingString() {
    const topConsumers = copy(this.get('topConsumingNames'));
    const gList = grammaticList(topConsumers);

    return gList + ((topConsumers.length > 1) ? ' together make ' : ' makes ');
  }


  @computed('data')
  get topFuel() {
    const data = copy(this.get('data'), true);

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
  }


  @computed('topFuel')
  get otherFuels() {
    const topFuel = this.get('topFuel');
    const otherFuels = fuelTypes.filter(type => fuelTypesMap[type].toLowerCase() !== topFuel)
                                .map(fuel => fuelTypesMap[fuel].toLowerCase());

    return grammaticList(otherFuels, {conjunction: 'or'});
  }


  @computed('data', 'criteriaColumn')
  get topEmissions() {
    const data = copy(this.get('data'), true);

    const totalEmissions = data.map(row => {
      return {
        name: row[this.get('criteriaColumn')],
        emissions: fuelTypes.reduce((a, type) => a += row[`${type}_emissions_co2`], 0)
      };
    });

    return maxRowByKey(totalEmissions, 'emissions').row;
  }


  @computed('topEmissions', 'valueMap')
  get topEmissionsName() {
    const valueMap = this.get('valueMap');
    const topEmissions = this.get('topEmissions');

    return (valueMap) ? valueMap[topEmissions.name] : topEmissions.name;
  }


  @computed('topEmissions', 'data')
  get topEmissionsPercentage() {
    const data = copy(this.get('data'), true);
    const topEmissions = this.get('topEmissions');

    const total = data.reduce((a,b) => a += fuelTypes.reduce((a, type) => a += b[`${type}_emissions_co2`], 0), 0);

    return this.roundedPercentage(topEmissions.emissions, total);
  }


  roundedPercentage(numerator, denominator) {
    return Math.round(((numerator * 10000) / denominator)) / 100;
  }

}
