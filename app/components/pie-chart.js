import Ember from 'ember';
import d3 from 'npm:d3';
import slug from '../utils/slug';
import { fuelTypes, fuelTypesMap } from '../utils/fuel-types';

export default Ember.Component.extend({

  /**
   * Services
   */

  colorManager: Ember.inject.service(),


  /**
   * Members
   */

  tagName: '',
  normalizedTitle: null,
  metric: null,

  chartOptions: {
    width: 320,
    height: 320,
    numTicks: 3,
    tooltipDisplacement: 20,
    transitionDuration: 200,
  },


  /**
   * Methods
   */

  init() {
    this._super(...arguments) ;

    this.set('normalizedTitle', slug(this.get('title')).normalize());

    this.calculateChartDimensions();

    Ember.$(window).resize(() => {
      this.calculateChartDimensions(true);
    });
  },

  calculateChartDimensions(render = false) {
    const chartOptions = this.get('chartOptions');

    const size = (window.innerWidth > 670) ? 320 : (window.innerWidth > 480) ? 240 : 180;

    chartOptions.width = size;
    chartOptions.height = size;

    this.set('chartOptions', chartOptions);

    if (render)  {
      this.resizeSVGElement(size);

      this.didRender();
    }
  },

  resizeSVGElement(size) {
    const normalizedTitle = this.get('normalizedTitle');

    d3.select(`#${normalizedTitle}`)
      .select('svg')
      .attr('width', size)
      .attr('height', size)
      .select('g')
      .attr('transform', `translate(${size/2},${size/2})`);
  },


  didInsertElement() {
    this._super(...arguments);

    const { width, height } = this.get('chartOptions');
    const normalizedTitle = this.get('normalizedTitle');

    d3.select(`#${normalizedTitle}`)
      .append('svg')
      .append('g');

    this.resizeSVGElement(Math.max(width, height));

    d3.select(`#${normalizedTitle}`)
      .append('div')
      .attr('class', 'legend')
      .append('ul');

    d3.select('.tooltip-holder')
      .append('div')
      .attr('class', 'tooltip');
  },


  unitTransform(context, val) {
    const metric = context.get('metric');

    const transforms = {
      con_mmbtu: val => `${val} <span>mmbtu</span>`,
      emissions_co2: val => `${val} <span>lbs CO<small>2</small>e</span>`,
      exp_dollar: val => `<span>$</span>${val}`,
    };

    return transforms[metric](val);
  },


  didRender() {
    this._super(...arguments);

    const { width, height, transitionDuration, tooltipDisplacement } = this.get('chartOptions');
    const normalizedTitle = this.get('normalizedTitle');
    const colors = this.get('colorManager').colors;
    const metric = this.get('metric');
    const minDim = Math.min(width, height);

    const color = d3.scaleOrdinal([colors.orellow, colors.lightGreen, colors.blue]);

    const data = Ember.copy(this.get('data'), true);

    const arc = d3.arc()
                  .innerRadius(minDim/3.5)
                  .outerRadius(minDim/2);

    const pie = d3.pie()
                  .sort(null)
                  .value(d => d.percent);

    const svg = d3.select(`#${normalizedTitle}`).select('svg').select('g');

    const legend = d3.select(`#${normalizedTitle}`)
                     .select('.legend')
                     .select('ul')
                     .selectAll('li')
                     .data(fuelTypes)
                     .enter()
                     .append('li');
                    
    legend.append("span")
          .attr('class', 'fuel-color')
          .style('background', d => color(d));

    legend.append('span')
          .attr('class', 'fuel-name')
          .html(d => fuelTypesMap[d]);

    const tooltip = d3.select('.tooltip-holder')
                      .append('div')
                      .attr('class', 'tooltip');

    tooltip.append('div')
           .attr('class', 'percent');

    const pathInfo = tooltip.append('div')
                            .attr('class', 'path-info');

    pathInfo.append('div')
           .attr('class', 'fuel-type');
    
    pathInfo.append('div')
           .attr('class', 'value');


    fuelTypes.forEach(type => data[0][`${type}_tot`] = 0);

    // Aggregate totals for each fuel type
    let totals = {};
    if (data.length > 1) {
      totals = data.reduce((aggregate, current) => {
        fuelTypes.forEach(type => aggregate[`${type}_tot`] += parseFloat(current[`${type}_${metric}`]));
        return aggregate;
      });
    }
    else {
      fuelTypes.forEach(type => totals[`${type}_tot`] = parseFloat(data[0][`${type}_${metric}`]));
    }

    // Get total for all fuel consumption
    data.cent = fuelTypes.map(type => totals[`${type}_tot`]).reduce((x, y) => x + (y || 0));

    const results = fuelTypes.map(type => {
      return {
        fuel_type: type,
        percent: totals[`${type}_tot`] / data.cent,
        value: totals[`${type}_tot`],
      };
    });

    // Start composing chart
    let path = svg.selectAll('path').data(pie(results));

    path.enter()
        .append('path')
        .attr('d', arc)
        .style('fill', d => color(d.data.fuel_type))
        .each(function(d) { this._current = d })
        .on('mouseover', d => {
          const percent = Math.round(100 * d.data.percent);

          tooltip.select('.fuel-type')
                 .html(fuelTypesMap[d.data.fuel_type]);

          tooltip.select('.value')
                 .html(this.get('unitTransform')(this, Math.round(d.data.value).toLocaleString('en-us')));

          tooltip.select('.percent')
                 .html(String(percent) + '%')
                 .style('color', color(d.data.fuel_type));

          tooltip.style('display', 'block');
        })
        .on('mouseout', () => {
          tooltip.style('display', 'none');
        })
        .on('mousemove', function() {
          const mouseCoords = d3.mouse(this);

          tooltip.style('top', String(mouseCoords[1] - (tooltipDisplacement * .75)) + 'px')
                 .style('left', String(mouseCoords[0] + (tooltipDisplacement * 1.5)) + 'px');
        });

    path.transition()
        .duration(transitionDuration)
        .attrTween('d', function(a) {
          const i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) { return arc(i(t)) };
        });
  },

});
