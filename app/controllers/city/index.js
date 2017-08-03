import Ember from 'ember';
import { fuelTypes, fuelTypesMap } from '../../utils/fuel-types';

export default Ember.Controller.extend({

  /**
   * Members
   */

  municipality: Ember.computed('model', function() {
    return this.get('model').municipality;
  }),

  sectors: Ember.computed('model', function() {
    const data = Object.keys(this.get('model')).filter(key => key !== 'municipality');
    data.push('total');

    return data;
  }),

  fuelTypeData: Ember.computed('model', 'sectors', function() {
    const model = this.get('model');
    const sectors = this.get('sectors');

    const data = fuelTypes.map(_type => {

      let sectorData = sectors.filter(sector => sector !== 'total').map(sector => {
          return {
            consumption: 33,
            emissions: 234,
            cost: 5,
          };
      });

      // Make copy of first column since it will be used by reference in the reducer
      const original = Object.assign({}, sectorData[0]);

      // Calculate the total column
      sectorData.push(sectorData.reduce((aggregate, current) => {
        Object.keys(aggregate).forEach(key => {
          aggregate[key] += current[key];
        });

        return aggregate;         
      }));

      // Restore column back to its original state
      sectorData[0] = original;

      return {
        type: fuelTypesMap[_type],
        sectors: sectorData,
      };
    });

    return data;
  }),

});
