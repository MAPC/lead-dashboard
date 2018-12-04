import Component from '@ember/component';
import sectors from 'lead-dashboard/utils/sectors';
import { computed } from '@ember-decorators/object';


export default class StackedAreaChartLayoutComponent extends Component {

  @computed(`data.{${sectors.join(',')}}.rows.[]`)
  get chartData() {
    const data = this.get('data');
    return data;
  }

}
