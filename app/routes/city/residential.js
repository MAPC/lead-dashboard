import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    const cityModel = this.modelFor('city');

    console.log(cityModel.sectorData['commercial']);
    console.log(cityModel.sectorData['residential']);

    return Ember.RSVP.hash({
      sectorData: cityModel.sectorData['residential'],
      municipality: cityModel.municipality,
    });
  }

});
