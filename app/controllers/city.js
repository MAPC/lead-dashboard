import Ember from 'ember';
import { sectorRouteMap } from '../utils/sectors';

export default Ember.Controller.extend({

  /**
   * Members
   */

  sectors: sectorRouteMap,


  /**
   * Methods
   */

  actions: {

    disableSector(sectorName) {
      const sectors = this.get('sectors');
      const sector = sectors.filter(sector => sector.name.toLowerCase() === sectorName)[0];

      Ember.set(sector, 'disabled', true);
    },

  }

});
