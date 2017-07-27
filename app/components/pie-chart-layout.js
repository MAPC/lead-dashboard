import Ember from 'ember';
import fuelTypes from '../utils/fuel-types';

export default Ember.Component.extend({

  /**
   * Members
   */

  criteria: [],
  criteriaColumn: null,

  metric: 'con_mmbtu',

  chartData: [],

  
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
      this.set('metric', metric)
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
