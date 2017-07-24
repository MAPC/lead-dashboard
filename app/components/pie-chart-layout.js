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

  didRender() {
    this._super(...arguments);
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
      console.log(criterion);
    }
     
  }

});
