import Route from '@ember/routing/route';
import { hash  } from 'rsvp';


export default class extends Route {

  model() {
    const cityModel = this.modelFor('city');

    return hash({
      sectorData: cityModel.sectorData['industrial'],
      municipality: cityModel.municipality,
    });
  }

}
