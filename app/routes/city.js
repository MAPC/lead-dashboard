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
    return this.get('carto').allSectorDataFor(params.municipality);
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
