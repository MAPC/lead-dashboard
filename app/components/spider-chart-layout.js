import d3 from "d3";
import { copy } from 'ember-copy';
import Component from '@ember/component';
import { htmlSafe } from '@ember/template';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';

import fuelTypes from '../utils/fuel-types';
import capitalize from '../utils/capitalize';
import grammaticList from '../utils/grammatic-list';


export default class extends Component {

  /**
   * Services
   */

  @service carto;
  @service colorManager;


  /**
   * Members
   */

  analysis = {
    consumption: '',
    emissions: '',
    cost: '',
  };

  showingAnalysis = false;
  comparisonLimit = 4;
  otherMuniData = [];


  @computed('data.rows.[]', 'otherMuniData.[]')
  get mixedData() {
    return [...this.get('data.rows'), ...this.get('otherMuniData')];
  }



  /**
   * Methods
   */

  constructor() {
    super(...arguments);

    this.set('comparisonList', []);
    this.updateCharts();

    /**
     * This list is used by the spider chart layout to populate
     * a list of possible municipalities to compare our current
     * municipality to. Therefore, we don't want to have our
     * current municipality in that list.
     */
    const municipalities = this.get('municipalities')
                               .filter(municipality => municipality !== this.get('municipality'))
                               .sort();

    this.set('municipalityList', copy(municipalities, true));
  }


  beingViewed() {
    return  [this.get('municipality')].concat(this.get('comparisonList').map(muni => muni.name));
  }


  updateCharts() {
    const data = this.get('mixedData');
    const beingViewed = this.beingViewed();

    let munged = data.map(row => {
      row.criterion = row[this.get('criteria')];
      row.color = this.get('colorManager').colorFor(row.municipal, beingViewed);

      row.totalConsumption = 0;
      row.totalEmissions = 0;
      row.totalCost = 0;
      fuelTypes.forEach(type => {
        row.totalConsumption += row[`${type}_con_mmbtu`];
        row.totalEmissions += row[`${type}_emissions_co2`];
        row.totalCost += row[`${type}_exp_dollar`];
      });

      return row;
    });

    this.set('chartData', munged);
    this.updateTextAnalysis();
  }


  updateTextAnalysis() {
    const colorWrap = function colorWrap(muni) {
      const muniColor = this.get('colorManager').colorFor(muni);
      return htmlSafe(`<span style="color: ${muniColor};">${muni}</span>`);
    }.bind(this);

    const chartData = copy(this.get('chartData'), true);

    const nestedData = d3.nest()
                         .key(d => d.municipal)
                         .entries(chartData);

    const aggregateData = nestedData.map(muniSet => {
      const aggregate = muniSet.values.reduce((a,b) => {
        const values = {};

        ['totalConsumption', 'totalEmissions', 'totalCost'].forEach(col => {
          values[col] = a[col] + b[col];
        });

        return values;
      });

      return {municipal: muniSet.key, values: aggregate};
    });

    const currentMuni = aggregateData.shift();

    if (aggregateData.length === 0) {
      this.set('showingAnalysis', false) ;
    }
    else {
      const analysis = {
        consumption: `${colorWrap(currentMuni.municipal)} consumes `,
        emissions: `${colorWrap(currentMuni.municipal)} emits `,
        cost: `${colorWrap(currentMuni.municipal)} spends `,
      };

      Object.keys(analysis).forEach(metric => {
        const metricString = `total${capitalize(metric)}`;

        // Generate the string analysis
        analysis[metric] = aggregateData.reduce((a,b) => {
          var comparison = '',
              percent = null,
              bString = colorWrap(b.municipal),
              bValue = b.values[metricString],
              currentMuniValue = currentMuni.values[metricString];

          if (bValue > currentMuniValue) {
            percent = Math.floor(((bValue - currentMuniValue) / currentMuniValue) * 100);
            comparison = `<span>${percent}%</span> less than ${bString}`;
          }
          else if (bValue < currentMuniValue) {
            percent = Math.floor(((currentMuniValue - bValue) / bValue) * 100);
            comparison = `<span>${percent}%</span> more than ${bString}`;
          }
          else {
            comparison = `the same ammount as ${bString}`;
          }

          return `${a} ${comparison},`;
        }, analysis[metric]);

        analysis[metric] = grammaticList(analysis[metric], {period: true});
      });

      this.set('analysis', analysis);
      this.set('showingAnalysis', true);
    }
  }


  @action
  addToComparisonList(municipality) {
    const sector = this.get('sector');
    let list = this.get('comparisonList');

    if (list.length < this.get('comparisonLimit')) {
      const colorManager = this.get('colorManager');
      const beingViewed = [municipality].concat(this.get('beingViewed'));

      const municipalColor = colorManager.colorFor(municipality, beingViewed);
      list.pushObject({
        name: municipality,
        color: municipalColor
      });

      // Remove municipality from the list of options
      this.get('municipalityList').removeObject(municipality);

      // Fetch the data for the selected municipality then add
      this.get('carto')
          .query(`SELECT * FROM tabular.mapc_lead_${sector} WHERE municipal = '${municipality}'`)
          .then(response => {

            // In order to have Ember components rerender properly, we must
            // add the rows one at a time
            response.rows.forEach(row => {
              this.get('otherMuniData').pushObject(row);
            });

            this.updateCharts();
      });

    }
  }


  @action
  removeFromComparisonList(municipality) {
    this.get('comparisonList').removeObject(municipality);

    const colorManager = this.get('colorManager');
    let municipalities = this.get('municipalityList');
    const data = this.get('otherMuniData');

    // Put the municipality back in the dropdown
    municipalities.push(municipality.name);
    this.set('municipalityList', copy(municipalities.sort(), true));

    // Put the assinged color back in the color pool
    colorManager.resetColorFor(municipality.name);

    // Remove the municipality from our dataset
    this.set('otherMuniData', data.filter(row => row.municipal !== municipality.name));

    this.updateCharts();
  }

}
