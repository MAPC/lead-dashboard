import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  findAll: function(store, type) {
    // old query
    // queryTpl = 'SELECT heatwaveapp_towns.name, heatwaveapp_towns.cartodb_id, ST_Simplify(heatwaveapp_towns.the_geom,0.001), heatwaveapp_places.the_geom AS the_geom FROM {{table}}, heatwaveapp_places WHERE ST_Intersects(heatwaveapp_towns.the_geom, heatwaveapp_places.the_geom)',
    var queryTpl = "SELECT heatwaveapp_towns.name, heatwaveapp_towns.municipal, heatwaveapp_towns.cartodb_id, ST_Simplify(heatwaveapp_towns.the_geom,0.1) AS the_geom FROM {{table}}, heatwaveapp_places WHERE heatwaveapp_towns.municipal IN ('" + config.MMC_towns.join("','") + "')",
        url = this.buildURL(type, queryTpl),
        response = {};

    return this.ajax(url + '&format=geojson', 'GET').then(function(featureColl) {
      response[type.typeKey.pluralize()] = featureColl.features.map(function(feature) {
        feature.id = feature.properties.cartodb_id;
        return feature;
      });
      return response;
    });
  }
});
