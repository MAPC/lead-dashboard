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
    this.set('municipality', municipality);

    sectors.forEach(sector => {
      data[sector] = this.get('carto').query(`SELECT * FROM leap_dashboard_${sector} WHERE municipal = '${municipality}'`);
    });

    return data;
  },


  /**
   * @param EmberController controller
   * @param EmberModel model
   */
  setupController(controller, model) {
    controller.set('municipality', this.get('municipality'));
    this._super(controller, model);
  }

});
