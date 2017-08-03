import Ember from 'ember';
import fuelTypes from '../utils/fuel-types';

export default Ember.Component.extend({

  /**
   * Members
   */

  chartData: [],

  criteria: [],
  criteriaColumn: null,

  metricMap: {
    'Consumption': 'con_mmbtu',
    'Emissions': 'emissions_co2',
    'Cost': 'exp_dollar',
  },

  metrics: Ember.computed('metricMap', function() {
    return Object.keys(this.get('metricMap'));
  }),

  selectedMetric: Ember.computed('metrics', function() {
    return this.get('metrics')[0];
  }),

  metric: Ember.computed('selectedMetric', 'metricMap', function() {
    return this.get('metricMap')[this.get('selectedMetric')];
  }),

  
  /**
   * Methods
   */

  init() {
    this._super(...arguments);

    const metric = this.get('metric');
    const criteriaColumn = this.get('criteriaColumn');
    const criteria = this.get('criteria');
    const data = this.get('data');

    const chartData = data.rows.filter(row => {
      return !fuelTypes.every(type => row[`${type}_${metric}`] === 0);
    });

    this.set('chartData', chartData);

    if (criteria.length === 0) {
      const criteria = chartData.map(row => row[criteriaColumn]);
      this.set('criteria', criteria);
    }
  },


  actions: {

    /**
     * @param String metric
     */
    changeChartMetric(metric) {
      this.set('selectedMetric', metric);
      this.set('metric', this.get('metricMap')[metric])
    },


    /**
     * @param String criterion
     */
    changeChartCriteria(criterion) {
      const criteriaColumn = this.get('criteriaColumn');
      let chartData = this.get('data').rows;

      if (criterion !== 'all') {
        chartData = chartData.filter(row => row[criteriaColumn] === criterion)
      }

      this.set('chartData', chartData);
    }
     
  }

});
