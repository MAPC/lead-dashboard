import Component from '@ember/component';
import sectors from 'lead-dashboard/utils/sectors';
import { computed } from '@ember-decorators/object';

import { fuelTypes } from 'lead-dashboard/utils/fuel-types';


export default class StackedAreaChartLayoutComponent extends Component {

  @computed(`data.{${sectors.join(',')}}.rows.[]`)
  get chartData() {
    const data = this.get('data');

    const mapped = sectors.map(sector =>
      ((data[sector] || {}).rows || []).map(row =>
        fuelTypes.map(fuel => ({
          x: row['year'],
          y: row[`${fuel}_con_mmbtu`],
          z: `${sector}-${fuel}`,
        })).reduce((a,b) => a.concat(b), [])
      ).reduce((a,b) => a.concat(b), [])
    ).reduce((a,b) => a.concat(b), []);

    return mapped;
  }

}
