import Component from '@ember/component';
import { computed } from '@ember-decorators/object';


export default class extends Component {

  @computed('muniSectorData')
  get noSectorData() {
    return !(this.get('muniSectorData').length);
  }

}
