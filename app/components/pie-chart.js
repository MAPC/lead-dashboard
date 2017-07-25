import Ember from 'ember';
import d3 from 'npm:d3';
import slug from '../utils/slug';

export default Ember.Component.extend({

  /**
   * Members
   */

  tagName: '',
  chartInnerPadding: 10,

  chartOptions: {
    w: 400,
    h: 400,
    numTicks: 3,
  },


  /**
   * Methods
   */

  didRender() {
    this._super(...arguments);

    const chartOptions = this.get('chartOptions');
    const minDim = Math.min(chartOptions.w, chartOptions.h);
    const radius = (minDim / 2) - this.get('chartInnerPadding');
    const fuel_types = ['elec', 'ng', 'foil']


    // Setup d3 
    const color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    const arc = d3.arc()
                  .outerRadius(minDim/2)
                  .innerRadius(minDim/8);

    const pie = d3.pie()
                  .sort(null)
                  .value(d => d.mmbtu);

    const title = slug(this.get('title')).normalize();

    const svg = d3.select(`#${title}`)
                  .append('svg')
                  .attr('width', chartOptions.w)
                  .attr('height', chartOptions.h)
                  .append('g')
                  .attr('transform', `translate(${chartOptions.w/2},${chartOptions.h/2})`);


    // Munge data

    // Aggregate totals for each fuel type
    const data = this.get('data').rows.reduce((aggregate, current) => {

      // Ensure that the aggregate has the fuel type totals initialized
      if (fuel_types.any(type => aggregate[`${type}_tot`] === undefined)) {
        fuel_types.forEach(type => aggregate[`${type}_tot`] = 0);
      }

      fuel_types.forEach(type => aggregate[`${type}_tot`] += parseFloat(current[`${type}_con_mmbtu`]));
      return aggregate;
    });

    // Get total for all fuel consumption
    data.cent = fuel_types.map(type => data[`${type}_tot`]).reduce((x, y) => x + y);

    const results = fuel_types.map(type => {
      return {
        fuel_type: type,
        percent: data[`${type}_tot`] / data.cent,
        mmbtu: data[`${type}_tot`],
      };
    });

    // Start composing chart
    let g = svg.selectAll('.arc')
               .data(pie(results))
               .enter()
               .append('g')
               .attr('class', 'arc');
    
    g.append('path')
      .attr('d', arc)
      .style('fill', d => color(d.data.fuel_type));

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

    /*
    circleAxes.append('svg:text')
              .attr('text-anchor', 'center')
              .attr('dy', d => d - 5)
              .style('fill', '#FFF')
              .text((d, i) => i * (100/chartOptions.numTicks));
    */
  }

});
