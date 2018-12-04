import Route from '@ember/routing/route';
import { hash } from 'rsvp';


export default class extends Route {

  model() {
    const cityModel = this.modelFor('city');
    const sectors = Object.keys(cityModel.sectorData);

    const toPromise = {
      municipality: cityModel.municipality,
    };

    sectors.forEach(sector => {
      toPromise[sector] = cityModel.sectorData[sector];
    });

    return hash(toPromise);
  }


  activate() {
    const cityIndexController = this.controllerFor('city.index');

    cityIndexController.send('compareTo', cityIndexController.randomMunicipality(false));
  }

}
