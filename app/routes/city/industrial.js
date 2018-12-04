import Route from '@ember/routing/route';
import { hash  } from 'rsvp';


export default class extends Route {

  model() {
    const cityModel = this.modelFor('city');

    return hash({
      data: cityModel.sectorData['industrial'],
      municipality: cityModel.municipality,
    });
  }


  afterModel(model) {
    model['sectorData'] = {};

    if (model.data.rows) {
      const latestYear = Math.max(...model.data.rows.map(row => row.year));
      model['sectorData']['rows'] = model.data.rows.filter(row => row.year === latestYear);
    }
    else {
      model['sectorData']['rows'] = [];
    }
  }

}
