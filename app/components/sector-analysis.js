import Ember from 'ember';
import maxRowByKey from '../utils/max-row-by-key';
import grammaticList from '../utils/grammatic-list';
import { fuelTypes, fuelTypesMap } from '../utils/fuel-types';

const { computed } = Ember;


export default Ember.Component.extend({

  municipality: computed('data', function() {
    return this.get('data')[0].municipal;
  }),


  topConsuming: computed('data', 'municipality', function() {
  
  }),


  topConsumingPercentage: computed('topConsuming', 'data', function() {
  
  }),


  topConsumingNames: computed('topConsuming', function() {
  
  }),


  topConsumingName: computed('topConsumingNames', function() {
  
  }),


  topConsumingString: computed('topConsumingNames', function() {
  
  }),


  topFuel: computed('data', function() {
  
  }),


  otherFuels: computed('topFuel', function() {
  
  }),


  topEmissions: computed('data', 'municipality', function() {
  
  }),


  topEmissionsPercentage: computed('topEmissions', 'data', function() {
  
  }),


  topEmissionsName: computed('topEmissions', function() {
  
  }),


});
