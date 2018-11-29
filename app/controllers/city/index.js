import DS from 'ember-data';
import Controller from '@ember/controller';
import { hash } from 'rsvp';
import { copy } from '@ember/object/internals';
import { service } from '@ember-decorators/service';
import { controller } from '@ember-decorators/controller';
import { computed, action } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';

import slug from '../../utils/slug';
import sectors from '../../utils/sectors';
import { fuelTypes, fuelTypesMap } from '../../utils/fuel-types';


export default class extends Controller {

  /**
   * Controllers
   */

  @controller city;


  /**
   * Services
   */

  @service carto;
  @service router;
  @service municipalityList;


  /**
   * Members
   */


  comparingTo = null;
  municipalities = [];
  fuelNames = Object.values(fuelTypesMap);

  @reads('model.municipality') municipality;

  @computed
  get sectors() {
    const _sectors = sectors;
    _sectors.unshift('total');

    return _sectors;
  }

  @computed('model')
  get fuelTypeData() {
    const munged = this.munger(this.get('model'));

    const fuelTypeData = munged.map(fuelType => {
      if (fuelType.type.toLowerCase() === 'electricity') {
        fuelType.footnote = true;
      }

      return fuelType;
    });

    return fuelTypeData;
  }


  @computed('fuelTypeData')
  get fuelPercentages() {
    const fuelTypeData = this.get('fuelTypeData');

    return {
      emissions: fuelTypeData.map(type => type.sectors[0].emissionsPercentage),
      consumption: fuelTypeData.map(type => type.sectors[0].consumptionPercentage),
    };
  }


  @computed('model', 'setors', 'fuelTypeData')
  get totalEmissions() {
    const fuelTypeData = this.get('fuelTypeData');

    const totals = fuelTypeData.map(type => type.sectors)
                               .reduce((a,b) => a.concat(b))
                               .filter(row => row.sector === 'total');

    const totalEmissions = totals.reduce((x, total) => x + total.emissions, 0);

    return totalEmissions;
  }


  @computed('fuelTypeData')
  get largestEmitter() {
    const fuelTypeData = this.get('fuelTypeData');
    const sectorTotals = {};

    fuelTypeData.forEach(type => {
      type.sectors.filter(x => x.sector !== 'total').forEach(sectorData => {
        if (!sectorTotals[sectorData.sector]) {
          sectorTotals[sectorData.sector] = 0;
        }

        sectorTotals[sectorData.sector] += sectorData.emissionsPercentage;
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
  }


  @computed('carto', 'municipality')
  get populationCensus() {
    const carto = this.get('carto');
    const municipality = this.get('municipality');

    return DS.PromiseObject.create({
      promise: carto.populationFor(municipality).then(response => {
        return {
          estimate: response.rows[0].pop_est,
          year: response.rows[0].years,
        };
      }),
    });
  }



  /**
   * Methods
   */

  constructor() {
    super(...arguments);

    this.get('municipalityList').listFor().then(response => {
      const municipalities = response.rows.map(row => row.municipal).sort();

      this.set('municipalities', municipalities);
      this.send('compareTo', this.randomMunicipality());
    });
  }

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
  }

  munger(_model) {
    if (!this.get('sectors')) return;

    const model = copy(_model, true);
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
              .forEach(key => {
                aggregate[key] += current[key];
              });

        return aggregate;
      }));

      // Restore column back to its original state
      sectorData[0] = original;
      sectorData[sectorData.length - 1].sector = 'total';

      sectorData.unshift(sectorData.pop());

      return {
        type: fuelTypesMap[_type],
        sectors: sectorData,
      };
    });

    // Sum the consumption values from the 'total' column
    const totalConsumption = data.map(datum => datum.sectors[0].consumption)
                                 .reduce((a, b) => a + b);

    const totalEmissions = data.map(datum => datum.sectors[0].emissions)
                                 .reduce((a, b) => a + b);

    // Normalize the data
    data.forEach(datum => {
      datum.sectors.forEach(sector => {
        sector.consumption /= (totalConsumption / 100);
        sector.emissions /= (totalEmissions / 100);

        Object.keys(sector).filter(key => key !== 'sector').forEach(key => {

          // Show one decimal place if the value is less than 1
          let roundFactor = 1;
          if (sector[key] % 1 === sector[key]) roundFactor = 10;

          sector[`${key}Percentage`] = Math.round(sector[key] * roundFactor) / roundFactor;
        });

        sector.consumption /= (100 / totalConsumption);
        sector.emissions /= (100 / totalEmissions);
      });
    });


    return data;
  }


  @action
  compareTo(_comparingTo) {
    const sectorPromises = this.get('carto').allSectorDataFor(_comparingTo);

    hash(sectorPromises.sectorData).then(response => {
      const munged = this.munger(response);

      if (munged) {
        const comparingTo = {
          municipality: _comparingTo,
          emissions: munged.map(row => row.sectors[0].emissionsPercentage),
          consumption: munged.map(row => row.sectors[0].consumptionPercentage),
        };

        this.set('comparingTo', comparingTo);
      }
    });
  }


  @action
  changeMunicipality(municipality) {
    this.get('router').transitionTo('city.index', slug(municipality).normalize());
    this.send('compareTo', this.randomMunicipality());
  }


  @action
  downloadTableData() {
    const fuelTypeData = this.get('fuelTypeData');
    const municipality = this.get('municipality');

    const flattened = fuelTypeData.map(typeSet => {
      return typeSet.sectors.map(sector => {
        sector.fuel_type = typeSet.type.toLowerCase();
        return sector;
      });
    });

    const reduced = flattened.reduce((a,b) => a.concat(b));

    const renamed = reduced.map(row => {
      return {
        fuel_type_index: row.fuel_type,
        sector_index: row.sector,
        consumption_total_mmbtu: row.consumption,
        consumption_percentage: row.consumptionPercentage / 100,
        emissions_total_lbs_CO2e: row.emissions,
        emissions_percentage: row.emissionsPercentage / 100,
        cost_dollars: row.cost,
      };
    });

    const csvHeader = "data:text/csv;charset=utf-8,";

    const documentHeader = Object.keys(renamed[0]);
    const documentRows = renamed.map(row => Object.keys(row).map(key => row[key]));

    const documentStructure = [[documentHeader], documentRows].reduce((a,b) => a.concat(b));
    const documentBody = documentStructure.reduce((a,b) => `${a}\n${b}`)

    const csvFile = csvHeader + documentBody;
    const encoded = encodeURI(csvFile);

    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `${municipality.toLowerCase()}_at-a-glance_data.csv`);

    document.body.appendChild(link);
    link.click();
  }

}
