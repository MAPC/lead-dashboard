import Ember from 'ember';
import slug from '../utils/slug';

export default Ember.Route.extend({

  /**
   * Services
   */

  carto: Ember.inject.service(),


  /**
   * Members
   */

  municipality: null,


  /**
   * Methods
   */

  /**
   * @param Object<Mixed> params
   *
   * @return Object<AjaxResponseObjects>
   */
  model(params) {
    const sectors = ['commercial', 'residential', 'industrial'];
    const data = {};

    const municipality = slug(params.municipality).denormalize();

    sectors.forEach(sector => {
      data[sector] = this.get('carto').query(`SELECT * FROM led_${sector} WHERE municipal = '${municipality}'`);
    });

    return {sectorData: data, municipality: municipality};
  },


  /**
   * @param EmberController controller
   * @param EmberModel model
   */
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('municipality', this.get('municipality'));
  },


});
