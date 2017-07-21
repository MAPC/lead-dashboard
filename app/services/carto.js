import Ember from 'ember';

export default Ember.Service.extend({

  /**
   * Services
   */

  ajax: Ember.inject.service(),


  /**
   * Methods
   */

  /**
   * @param String queryString
   *
   * @return AjaxResponseObject
   */
  query(queryString) {
    const cartoURL = 'https://mapc-admin.carto.com/api/v2/sql?format=json&q=';
    let cleanQueryString = queryString.split(" ").join("%20")
                                      .split("‘").join("%27");

    return this.get('ajax').request(`${cartoURL}${cleanQueryString}`);
  }

});
