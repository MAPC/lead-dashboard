import Ember from 'ember';
import grammaticList from '../../utils/grammatic-list';

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

      let max = -1;
      var maxIndex = null;
      muniSectorData.forEach((row, index) => {
        if (row.total_con_mmbtu > max) {
          max = row.total_con_mmbtu;
          maxIndex = index; 
        }
      });

      topConsumers.push(muniSectorData[maxIndex]);
      muniSectorData.splice(maxIndex, 1);
    }

    return topConsumers;
  }),


  topConsumingNames: computed('topConsumingIndustries', function() {
    return this.get('topConsumingIndustries').map(consumer => consumer.naicstitle);
  }),


  topConsumingPercentage: computed('topConsumingIndustries', 'sectorData', function() {
    const topConsumers = Ember.copy(this.get('topConsumingIndustries'), true);
    const sectorData =  Ember.copy(this.get('sectorData'), true);

    const total = sectorData.rows.reduce((a, row) => a += row.total_con_mmbtu, 0);
    const topTotal = topConsumers.reduce((a, row) => a += row.total_con_mmbtu, 0);

    return Math.round(((topTotal * 10000) / total)) / 100;
  }),


  topConsumingIndustriesString: computed('topConsumingNames', function() {
    const topConsumers = Ember.copy(this.get('topConsumingNames'));
    const gList = grammaticList(topConsumers, {period: false});
    
    return gList + ((topConsumers.length > 1) ? ' together make ' : ' makes ');
  }),


  topConsumingIndustry: computed('topConsumingNames', function() {
    return Ember.copy(this.get('topConsumingNames'))[0];
  }),


  topFuel: computed('sectorData', function() {
  
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
