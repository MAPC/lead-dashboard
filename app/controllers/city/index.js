import Ember from 'ember';
import slug from '../../utils/slug';
import sectors from '../../utils/sectors';
import { fuelTypes, fuelTypesMap } from '../../utils/fuel-types';

export default Ember.Controller.extend({

  /**
   * Controllers
   */

  city: Ember.inject.controller(),
  

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

  sectors: Ember.computed(function() {
    const _sectors = sectors;
    _sectors.push('total');

    return _sectors;
  }),


  municipality: Ember.computed.readOnly('model.municipality'),

  censusYear: '2010',
  population: 150700,

  fuelTypeData: Ember.computed('model', 'city', function() {
    //const cityController = this.get('city');
    const munged = this.munger(this.get('model'));

    const sectorSummary = munged.map(type => type.sectors)
                                .reduce((a,b) => a.concat(b))
                                .map(a => { return {[a.sector]: a.emissions }})
                                .reduce((a,b) => {
                                  Object.keys(b).forEach(key => a[key] =  a[key] + b[key] || 0);
                                  return a;
                                });

    Object.keys(sectorSummary)
          .filter(sector => sectorSummary[sector] === 0)
          .forEach(()/*sector*/ => {
            //cityController.send('disableSector', sector);
          });


    return munged;
  }),


  fuelPercentages: Ember.computed('fuelTypeData', function() {
    const fuelTypeData = this.get('fuelTypeData');

    return {
      emissions: fuelTypeData.map(type => type.sectors[type.sectors.length - 1].emissions),
      consumption: fuelTypeData.map(type => type.sectors[type.sectors.length - 1].consumption),
    };
  }),

  totalEmissions: Ember.computed('model', 'sectors', function() {
    const sectors = this.get('sectors').filter(sector => sector !== 'total');
    const model = this.get('model');

    const totalEmissions = sectors.map(sector => model[sector].rows)
                          .reduce((a,b) => a.concat(b))
                          .map(row => fuelTypes.reduce((a,type) => a + row[`${type}_emissions_co2`], 0))
                          .reduce((a,b) => a + b);

    return Math.floor(totalEmissions);
  }),


  largestEmitter: Ember.computed('fuelTypeData', function() {
    const fuelTypeData = this.get('fuelTypeData');
    const sectorTotals = {};

    fuelTypeData.forEach(type => {
      type.sectors.filter(x => x.sector !== 'total').forEach(sectorData => {
        if (!sectorTotals[sectorData.sector]) {
          sectorTotals[sectorData.sector] = 0;
        }

        sectorTotals[sectorData.sector] += sectorData.emissions;
      });
    });

    let max = -1;
    let largestEmitter = null;
    Object.keys(sectorTotals).forEach(sector => {
      if (sectorTotals[sector] > max) {
        max = sectorTotals[sector];
        largestEmitter = sector;
      }
    });

    this.set('largestEmitterPerc', max);

    return largestEmitter;
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

  randomMunicipality(replace = true) {
    const _randomMunicipality = this.get('_randomMunicipality');
    const municipalities = this.get('municipalities');

    const rand = Math.floor(Math.random() * municipalities.length);
    const municipality = municipalities[rand];

    if (replace || _randomMunicipality === null) {
      this.set('_randomMunicipality', municipality);
      return municipality;
    }

    return _randomMunicipality;
  },

  munger(_model) {
    if (!this.get('sectors')) return;

    const model = Ember.copy(_model, true);
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
      let sectorData = sectors.map(_sector => {
        return {
          sector: String(_sector),
          consumption: munged[_sector][`${_type}_con_mmbtu`],
          emissions: munged[_sector][`${_type}_emissions_co2`],
          cost: munged[_sector][`${_type}_exp_dollar`],
        };
      });

      // Make copy of first column since it will be used by reference in the reducer
      const original = Object.assign({}, sectorData[0]);

      // Calculate the total column
      sectorData.push(sectorData.reduce((aggregate, current) => {
        Object.keys(aggregate)
              .filter(key => key !== 'sector')
              .forEach(
          key => {
            aggregate[key] += current[key];
          });

        return aggregate;         
      }));

      // Restore column back to its original state
      sectorData[0] = original;
      sectorData[sectorData.length - 1].sector = 'total';

      return {
        type: fuelTypesMap[_type],
        sectors: sectorData,
      };
    });

    // Sum the consumption values from the 'total' column
    const totalConsumption = data.map(datum => datum.sectors[datum.sectors.length - 1].consumption)
                                 .reduce((a, b) => a + b);

    const totalEmissions = data.map(datum => datum.sectors[datum.sectors.length - 1].emissions)
                                 .reduce((a, b) => a + b);

    //this.set('totalEmissions', totalEmissions);

    // Normalize the data
    data.forEach(datum => {
      datum.sectors.forEach(sector => {
        sector.consumption /= (totalConsumption / 100); 
        sector.emissions /= (totalEmissions / 100);

        Object.keys(sector).filter(key => key !== 'sector').forEach(key => {

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

        if (munged) {
          const comparingTo = {
            municipality: _comparingTo ,
            emissions: munged.map(row => row.sectors[row.sectors.length - 1].emissions),
            consumption: munged.map(row => row.sectors[row.sectors.length - 1].consumption),
          };

          this.set('comparingTo', comparingTo);
        }
      });
    },


    changeMunicipality(municipality) {
      this.transitionToRoute('city.index', slug(municipality).normalize());
      this.send('compareTo', this.randomMunicipality());
    }
  
  }

});
