import Route from '@ember/routing/route';
import { hash  } from 'rsvp';


export default class extends Route {

  model() {
    const cityModel = this.modelFor('city');

    return hash({
      data: cityModel.sectorData['commercial'],
      municipality: cityModel.municipality,
    });
  }

  afterModel(model) {
    const latestYear = Math.max(...model.data.rows.map(row => row.year));
    model['sectorData'] = {};
    model['sectorData']['rows'] = model.data.rows.filter(row => row.year === latestYear);
  }

}
