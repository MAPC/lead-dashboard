import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    const cityModel = this.modelFor('city');
    const sectors = Object.keys(cityModel.sectorData);

    const toPromise = {
      municipality: cityModel.municipality,
    };

    sectors.forEach(sector => {
      toPromise[sector] = cityModel.sectorData[sector];
    });

    return Ember.RSVP.hash(toPromise);
  }

});
