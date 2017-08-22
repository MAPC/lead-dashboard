import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('city', { path: 'cities/:municipality' }, function() {
    this.route('industrial');
    this.route('residential');
    this.route('commercial');
  });
  this.route('learn-more');
});

export default Router;
