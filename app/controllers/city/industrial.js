import Ember from 'ember';

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

    const topCount = Math.min(3, muniSectorData.length);
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

    return topConsumers.map(consumer => consumer.naicstitle);
  }),

  topConsumingIndustry: computed('topConsumingIndustries', function() {
    return Ember.copy(this.get('topConsumingIndustries'))[0];
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
