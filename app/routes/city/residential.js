import Route from '@ember/routing/route';
import { hash  } from 'rsvp';


export default class extends Route {

  model() {
    const cityModel = this.modelFor('city');
    const sectorData = cityModel.sectorData['residential'];

    return hash({
      sectorData: cityModel.sectorData['residential'],
      municipality: cityModel.municipality,
    });
  }

}
