import Ember from 'ember';

export default Ember.Component.extend({

  /**
   * Members
   */

  criteria: [],
  criteriaColumn: null,

  chartData: [],

  
  /**
   * Methods
   */

  init() {
    this._super(...arguments);
    this.set('chartData', this.get('data').rows);
  },


  actions: {

    /**
     * @param String metric
     */
    changeChartMetric(metric) {
      console.log(metric);
    },


    /**
     * @param String criterion
     */
    changeChartCriteria(criterion) {
      let chartData;

      if (criterion !== 'all') {
        chartData = this.get('data').rows.filter(row => row[this.get('criteriaColumn')] === criterion)
      }
      else {
        chartData = this.get('data').rows;
      }

      this.set('chartData', chartData);
    }
     
  }

});
