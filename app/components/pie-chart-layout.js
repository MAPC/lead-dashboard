import Component from '@ember/component';
import { copy } from 'ember-copy';
import { action, computed } from '@ember-decorators/object';

import fuelTypes from '../utils/fuel-types';


export default class extends Component {

  /**
   * Members
   */

  metricMap = {
    'Consumption': 'con_mmbtu',
    'Emissions': 'emissions_co2',
    'Cost': 'exp_dollar',
  };


  @computed('metricMap')
  get metrics() {
    return Object.keys(this.get('metricMap'));
  }


  @computed('metrics')
  get selectedMetric() {
    return this.get('metrics')[0];
  }


  @computed('selectedMetric', 'metricMap')
  get metric() {
    return this.get('metricMap')[this.get('selectedMetric')];
  }


  @computed('metric', 'data.rows.[]')
  get metricData() {
    const metric = this.get('metric');
    const data = this.get('data.rows');

    return data.filter(row => {
      return !fuelTypes.every(type => row[`${type}_${metric}`] === 0 || row[`${type}_${metric}`] === null);
    });
  }


  @computed('metricData.[]', 'criteriaData.[]')
  get chartData() {
    return this.get('criteriaData') || this.get('metricData');
  }


  @computed('criteria', 'criteriaColumn', 'metricData.[]')
  get chartCriteria() {
    const criteria = this.get('criteria');

    if (criteria.length === 0) {
      const chartData = this.get('metricData');
      const criteriaColumn = this.get('criteriaColumn');

      return chartData.map(row => row[criteriaColumn]);
    }
    else {
      return criteria;
    }
  }


  /**
   * Methods
   */

  @action
  changeChartMetric(metric) {
    this.set('selectedMetric', metric);
    this.set('metric', this.get('metricMap')[metric])
  }


  @action
  changeChartCriteria(criterion) {
    let chartData = null;

    if (criterion !== 'all') {
      const criteriaColumn = this.get('criteriaColumn');
      const valueMap = this.get('valueMap');
      chartData = copy(this.get('data').rows, true);

      if (valueMap) {
        chartData = chartData.filter(row => valueMap[row[criteriaColumn]] === criterion);
      }
      else {
        chartData = chartData.filter(row => row[criteriaColumn] === criterion);
      }
    }

    this.set('criteriaData', chartData);
  }

}
