import Component from '@ember/component';
import sectors from 'lead-dashboard/utils/sectors';
import { computed } from '@ember-decorators/object';

import fmt from 'lead-dashboard/utils/fmt';
import { fuelTypes } from 'lead-dashboard/utils/fuel-types';


export default class StackedAreaChartLayoutComponent extends Component {

  metrics = {
    'Consumption': '_con_mmbtu',
    'Emissions': '_emissions_co2',
    'Cost': '_exp_dollar',
  };

  metricFormats = {
    'Consumption': fmt.number.localeString,
    'Emissions': fmt.number.localeString,
    'Cost': fmt.number.dollar,
  };

  labels = {
    'Consumption': 'MMBTU',
    'Emissions': 'Lbs. of CO2e',
    'Cost': 'Cost',
  };

  metricOptions = Object.keys(this.metrics);


  constructor() {
    super(...arguments);

    this.set('metric', 'Consumption');
  }


  @computed(`data.{${sectors.join(',')}}.rows.[]`, 'metric')
  get chartData() {
    const data = this.get('data');
    const metric = this.get('metric');

    const mapped = sectors.map(sector =>
      ((data[sector] || {}).rows || []).map(row =>
        fuelTypes.map(fuel => ({
          x: row['year'],
          y: row[`${fuel}${this.metrics[metric]}`],
          z: `${sector}-${fuel}`,
        })).reduce((a,b) => a.concat(b), [])
      ).reduce((a,b) => a.concat(b), [])
    ).reduce((a,b) => a.concat(b), []);

    return mapped;
  }


  @computed('chartData.[]')
  get xAxis() {
    const chartData = this.get('chartData');

    return {
      label: 'Year',
      ticks: chartData.uniqBy('x').length - 1,
      format: fmt.number.integer,
    };
  }


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
