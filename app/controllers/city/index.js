import Ember from 'ember';
import slug from '../../utils/slug';
import { fuelTypes, fuelTypesMap } from '../../utils/fuel-types';

export default Ember.Controller.extend({

  /**
   * Services
   */

  carto: Ember.inject.service(),
  municipalityList: Ember.inject.service(),


  /**
   * Members
   */


  comparingTo: null,
  municipalities: [],


  municipality: Ember.computed('model', function() {
    return this.get('model').municipality;
  }),


  sectors: Ember.computed('model', function() {
    const data = Object.keys(this.get('model')).filter(key => key !== 'municipality');
    data.push('total');

    return data;
  }),


  fuelTypeData: Ember.computed('model', 'sectors', function() {
    return this.munger(this.get('model'));
  }),


  fuelPercentages: Ember.computed('fuelTypeData', function() {
    const fuelTypeData = this.get('fuelTypeData');

    return fuelTypeData.map(type => type.sectors[type.sectors.length - 1].consumption);
  }),


  fuelNames: Object.values(fuelTypesMap),


  /**
   * Methods
   */

  init() {
    this._super(...arguments);

    this.get('municipalityList').listFor().then(response => {
      const municipalities = response.rows.map(row => row.municipal).sort();

      this.set('municipalities', municipalities);
      this.send('compareTo', this.randomMunicipality());
    });
  },

  randomMunicipality() {
    const municipalities = this.get('municipalities');
    const rand = Math.floor(Math.random() * municipalities.length);

    return municipalities[rand];
  },

  munger(model) {
    const sectors = this.get('sectors').filter(sector => sector !== 'total');

    const munged = {};
    sectors.forEach(sector => {
      let subModel = model[sector].rows;
      let aggregatedData = {};

      if (subModel.length === 0) {
        fuelTypes.forEach(type => {
          ['con_mmbtu', 'emissions_co2', 'exp_dollar'].forEach(col => {
            aggregatedData[`${type}_${col}`] = 0;
          });
        });
      }
      else {
        if (sector === 'residential') {
          subModel = subModel.filter(row => row.hu_type !== 'total');
        }

        aggregatedData = subModel.reduce((aggregate, current) => {
          Object.keys(aggregate).forEach(key => {
            aggregate[key] += parseFloat(current[key]) || 0;
          });

          return aggregate;
        });
      }

      munged[sector] = aggregatedData;
    });

    const data = fuelTypes.map(_type => {
      let sectorData = sectors.filter(sector => sector !== 'total').map(sector => {
        return {
          consumption: munged[sector][`${_type}_con_mmbtu`],
          emissions: munged[sector][`${_type}_emissions_co2`],
          cost: munged[sector][`${_type}_exp_dollar`],
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


    // Sum the consumption values from the 'total' column
    const totalConsumption = data.map(datum => datum.sectors[datum.sectors.length - 1].consumption)
                                 .reduce((a, b) => a + b);

    // Normalize the data
    data.forEach(datum => {
      datum.sectors.forEach(sector => {
        sector.consumption /= (totalConsumption / 100); 

        Object.keys(sector).forEach(key => {

          // Show one decimal place if the value is less than 1
          let roundFactor = 1;
          if (sector[key] % 1 === sector[key]) roundFactor = 10;

          sector[key] = Math.round(sector[key] * roundFactor) / roundFactor;
        });
      });
    });

    return data;
  },


  actions: {

    compareTo(_comparingTo) {
      const sectorPromises = this.get('carto').allSectorDataFor(_comparingTo);

      Ember.RSVP.hash(sectorPromises.sectorData).then(response => {
        const munged = this.munger(response);

        const comparingTo = {
          municipality: _comparingTo ,
          values: munged.map(row => row.sectors[row.sectors.length - 1].consumption),
        };

        this.set('comparingTo', comparingTo);
      });
    },


    changeMunicipality(municipality) {
      this.transitionToRoute('city.index', slug(municipality).normalize());
      this.send('compareTo', this.randomMunicipality());
    }
  
  }

});
