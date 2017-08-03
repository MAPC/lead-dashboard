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
    return Object.keys(this.get('model')).filter(key => key !== 'municipality');
  }),

  fuelTypeData: Ember.computed('model', 'sectors', function() {
    const model = this.get('model');
    const sectors = this.get('sectors');

    const data = fuelTypes.map(_type => {
      return {
        type: _type,
        sectors: sectors.map(sector => {
          return {
            consumption: '33',
            emissions: '234',
            cost: '5',
          };
        }),
      };
    });

    return data;
  }),

});
