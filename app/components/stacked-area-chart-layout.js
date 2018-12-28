import Component from '@ember/component';
import sectors from 'lead-dashboard/utils/sectors';
import { computed } from '@ember-decorators/object';

import fmt from 'lead-dashboard/utils/fmt';
import { fuelTypes } from 'lead-dashboard/utils/fuel-types';


export default class StackedAreaChartLayoutComponent extends Component {

  hasUncalibrated = false;

  metrics = {
    'Consumption': '_con_mmbtu',
    'Emissions': '_emissions_co2',
  };

  metricFormats = {
    'Consumption': fmt.number.localeString,
    'Emissions': fmt.number.localeString,
  };

  labels = {
    'Consumption': 'MMBTU',
    'Emissions': 'Lbs. of CO2e',
  };

  metricOptions = Object.keys(this.metrics);


  constructor() {
    super(...arguments);

    this.set('metric', this.metricOptions[0]);
  }


  @computed(`data.{${sectors.join(',')}}.rows.[]`, 'metric')
  get chartData() {
    const data = this.get('data');
    const metric = this.get('metric');

    const mapped = sectors.map(sector =>
      ((data[sector] || {}).rows || []).map(row => {
        if (row.calibrated) {
          return (
            fuelTypes.filter(t => t !== 'foil').map(fuel => ({
              x: row['year'],
              y: row[`${fuel}${this.metrics[metric]}`],
              z: `${sector}-${fuel}`,
            })).reduce((a,b) => a.concat(b), [])
          );
        }
        else {
          this.set('hasUncalibrated', true);
        }
      }).filter(x => x).reduce((a,b) => a.concat(b), [])
    ).reduce((a,b) => a.concat(b), []);

    return mapped;
  }


  xAxis = {
    label: 'Year',
    format: fmt.number.integer,
  };


  @computed('metric')
  get yAxis() {
    const metric = this.get('metric');

    return {
      ticks: 8,
      label: this.labels[metric],
      format: this.metricFormats[metric],
    };

  }

}
