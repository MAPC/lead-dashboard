import DS from 'ember-data';

const data_url = "https://mapc-admin.carto.com/api/v2/sql?q=%20select%20*%20from%20b04006_reported_ancestry_acs_m%20%20WHERE%20acs_year%20IN%20(%272005-09%27,%272006-10%27,%272007-11%27,%272008-12%27,%272009-13%27,%272010-14%27,%272011-15%27) LIMIT 5&format=json&filename=b04006_reported_ancestry_acs_m";

export default DS.RESTAdapter.extend({
  findAll: function(store, type) {
    let response = {};
    return this.ajax(data_url).then(function(featureColl) {
      response['cities'] = featureColl.rows.map(function(feature) {
        feature.id = feature.cartodb_id;
        return feature;
      });
      return response;
    });
  }
});
