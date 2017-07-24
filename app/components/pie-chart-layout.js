import Ember from 'ember';

export default Ember.Component.extend({

  /**
   * Members
   */

  criteria: [],


  /**
   * Methods
   */

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
