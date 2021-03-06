import Route from '@ember/routing/route';
import { service} from '@ember-decorators/service';


export default class extends Route {

  /**
   * Services
   */

  @service carto;

  /**
   * Methods
   */

  beforeModel() {
    this.transitionTo('/');
  }

  model(params) {
    return this.get('carto').allSectorDataFor(params.municipality);
  }

}
