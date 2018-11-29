import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
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
  this.route('methodology');
});

export default Router;
