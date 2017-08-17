import Ember from 'ember';
import d3 from "npm:d3";
import fuelTypes from '../utils/fuel-types';
import capitalize from '../utils/capitalize';

export default Ember.Component.extend({

  /**
   * Services
   */

  carto: Ember.inject.service(),
  colorManager: Ember.inject.service(),


  /**
   * Members
   */

  criteria: null,

  sector: null,

  analysis: {
    consumption: '',
    emissions: '',
    cost: '',
  },

  showingAnalysis: false,

  municipality: null,
  municipalities: [],
  municipalityList: [],

  comparisonLimit: 4,
  comparisonList: [],

  chartData: [],



  /**
   * Methods
   */

  init() {
    this._super(...arguments);

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

    this.set('municipalityList', Ember.copy(municipalities, true));
  },

  beingViewed() {
    return  [this.get('municipality')].concat(this.get('comparisonList').map(muni => muni.name));
  },

  updateCharts() {
    const data = this.get('data');
    const beingViewed = this.beingViewed();

    let munged = data.rows.map(row => {
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
  },


  updateTextAnalysis() {

    const colorWrap = function colorWrap(muni) {
      const muniColor = this.get('colorManager').colorFor(muni);
      return Ember.String.htmlSafe(`<span style="color: ${muniColor};">${muni}</span>`);
    }.bind(this);

    const chartData = Ember.copy(this.get('chartData'), true);

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


        // Format the string with proper grammar
        const split = analysis[metric].split(',');

        if (split.length !== 1) {
          split.pop(); // Remove trailing comma
          let lastComparison = split.pop() + '.';

          if (split.length !== 0) {
            lastComparison = ` and ${lastComparison}`;
          }

          if (split.length === 1) {
            lastComparison = `${split.pop()}${lastComparison}`;
          }

          split.push(lastComparison);
        }

        analysis[metric] = split.join(',');
      });

      this.set('analysis', analysis);
      this.set('showingAnalysis', true);
    }
  },


  actions: {

    /**
     * @param String municipality 
     */
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
            .query(`SELECT * FROM led_${sector} WHERE municipal = '${municipality}'`)
            .then(response => {
        
              // In order to have Ember components rerender properly, we must
              // add the rows one at a time
              response.rows.forEach(row => {
                this.get('data').rows.pushObject(row);
              });

              this.updateCharts();
        });

      }
    },


    /**
     * @param String municipality
     */
    removeFromComparisonList(municipality) {
      this.get('comparisonList').removeObject(municipality);
      
      const colorManager = this.get('colorManager');
      let municipalities = this.get('municipalityList');
      let data = this.get('data');

      // Put the municipality back in the dropdown
      municipalities.push(municipality.name);
      this.set('municipalityList', Ember.copy(municipalities.sort(), true));

      // Put the assinged color back in the color pool
      colorManager.resetColorFor(municipality.name);

      // Remove the municipality from our dataset
      data.rows = data.rows.filter(row => row.municipal !== municipality.name);
      this.set('data', data);

      this.updateCharts();
    },

  }

});
