import Ember from 'ember';
import d3 from 'npm:d3';
import slug from '../utils/slug';

export default Ember.Component.extend({

  /**
   * Members
   */

  tagName: '',
  normalizedTitle: null,

  chartOptions: {
    width: 400,
    height: 400,
    numTicks: 3,
    transitionDuration: 200,
  },


  /**
   * Methods
   */

  init() {
    this._super(...arguments) ;

    this.set('normalizedTitle', slug(this.get('title')).normalize());
  },

  didInsertElement() {
    this._super(...arguments);

    const { width, height } = this.get('chartOptions');

    d3.select(`#${this.get('normalizedTitle')}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);
  },

  didRender() {
    this._super(...arguments);

    const { width, height, transitionDuration } = this.get('chartOptions');
    const minDim = Math.min(width, height);
    const fuel_types = ['elec', 'ng', 'foil']

    const color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    const arc = d3.arc()
                  .innerRadius(0)
                  .outerRadius(minDim/2);

    const pie = d3.pie()
                  .sort(null)
                  .value(d => d.percent);

    const svg = d3.select(`#${this.get('normalizedTitle')}`).select('svg').select('g');

    const data = Ember.copy(this.get('data'), true);

    fuel_types.forEach(type => data[0][`${type}_tot`] = 0);

    // Aggregate totals for each fuel type
    let totals = {};
    if (data.length > 1) {
      totals = data.reduce((aggregate, current) => {
        fuel_types.forEach(type => aggregate[`${type}_tot`] += parseFloat(current[`${type}_con_mmbtu`]));
        return aggregate;
      });
    }
    else {
      fuel_types.forEach(type => totals[`${type}_tot`] = parseFloat(data[0][`${type}_con_mmbtu`]));
    }

    // Get total for all fuel consumption
    data.cent = fuel_types.map(type => totals[`${type}_tot`]).reduce((x, y) => x + y);

    const results = fuel_types.map(type => {
      return {
        fuel_type: type,
        percent: totals[`${type}_tot`] / data.cent,
        mmbtu: totals[`${type}_tot`],
      };
    });

    // Start composing chart
    let path = svg.selectAll('path').data(pie(results));

    path.enter()
        .append('path')
        .attr('d', arc)
        .style('fill', d => color(d.data.fuel_type))
        .each(function(d) {this._current = d});

    path.transition()
        .duration(transitionDuration)
        .attrTween('d', function(a) {
          const i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) { return arc(i(t)) };
        });

    /*
    g.append('text')
      .attr('transform', d => {
        console.log(d);
        console.log(arc.centroid(d));
        return `translate(${arc.centroid(d)})`
      })
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .text(d => d.data.fuel_type);
    */

    /*
    const sdat = [];
    [...Array(chartOptions.numTicks).keys()].forEach(i => sdat[i] = 20 + ((radius/chartOptions.numTicks) * i));

    const circleAxes = svg.selectAll('.circle-ticks')
                          .data(sdat)
                          .enter()
                          .append('svg:g')
                          .attr('class', 'circle-ticks');

    circleAxes.append('svg:circle')
              .attr('r', String)
              .attr('class', 'circle')
              .style('stroke', '#CCC')
              .style('opacity', 0.5)
              .style('fill', 'none');

    circleAxes.append('svg:text')
              .attr('text-anchor', 'center')
              .attr('dy', d => d - 5)
              .style('fill', '#FFF')
              .text((d, i) => i * (100/chartOptions.numTicks));
    */
  }

});
