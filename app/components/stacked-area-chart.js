import d3 from 'npm:d3';
import uuid from 'npm:uuid';
import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { observes } from '@ember-decorators/object';

import { maxToMargin, drawLegend } from 'lead-dashboard/utils/charts';


export default class StackedAreaChartComponent extends Component {

  @service colorManager;


  /**
   * Members
   */

  container = {
    height: 450,
    width: 800,
  };

  defaultMargin = {
    top: 20,
    left: 40,
    right: 20,
    bottom: 50,
  };

  transitionDuration = 200;


  /**
   * Methods
   */

  constructor() {
    super(...arguments);

    this.set('__chartID', `sac-${uuid.v4()}`);

    const colorManager = this.get('colorManager');
    const { colors }  = colorManager;

    this.set('colorMap', {
      'residential-elec': colors.orellow,
      'residential-ng': colorManager.offset(colors.orellow, .2),
      'residential-foil': colorManager.offset(colors.orellow, .4),
      'commercial-elec': colors.lightGreen,
      'commercial-ng': colorManager.offset(colors.lightGreen, .2),
      'commercial-foil': colorManager.offset(colors.lightGreen, .4),
      'industrial-elec': colors.blue,
      'industrial-ng': colorManager.offset(colors.blue, .2),
      'industrial-foil': colorManager.offset(colors.blue, .4),
    });

    const data = this.get('data');

    this.set('xAxis.ticks', data.uniqBy('x').length - 1);
  }


  didInsertElement() {
    super.didInsertElement(...arguments);

    const { width, height } = this.get('container');
    const __chartID = this.get('__chartID');

    const chart = d3.select(`#${__chartID}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${width} ${height}`);

    this.set('chart', chart);
    this.set('legend', d3.select(`#${__chartID}-legend`));
    this.renderChart();
  }


  @observes('data.[]', 'yAxis', 'xAxis')
  renderChart() {
    const chartData = this.get('data');
    const chart = this.get('chart');
    const colors = this.get('colorMap');
    const xAxisConf = this.get('xAxis');
    const yAxisConf = this.get('yAxis');

    const bonusLeftMargin = maxToMargin(d3.max(chartData, d => d.y));
    const margin = Object.assign({}, this.defaultMargin, {
      left: this.defaultMargin.left + bonusLeftMargin,
    });
    const width = (this.container.width - margin.left) - margin.right;
    const height = (this.container.height - margin.top) - margin.bottom;

    const x = d3.scaleLinear().domain(d3.extent(chartData, d => d.x)).range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const area = d3.area()
      .x(d => x(d.data.x))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    const existingKeys = chartData.map(d => d.z);

    const keyOrder = [
      'commercial-elec',
      'commercial-ng',
      'commercial-foil',
      'industrial-elec',
      'industrial-ng',
      'industrial-foil',
      'residential-elec',
      'residential-ng',
      'residential-foil',
    ];

    const keys = keyOrder.filter(key => existingKeys.includes(key));

    const stack = d3.stack();
    stack.keys(keys);

    chart.selectAll('*').remove(); // Clear chart before drawing

    const gChart = chart.append('g');
    gChart.attr('transform', `translate(${margin.left},${margin.top})`);

    let data = chartData.reduce((acc, row) => {
      acc[row.x] = { ...(acc[row.x] || {}), ...{[row.z]: row.y + ((acc[row.x] || {})[row.z] || 0)} };
      return acc;
    }, {});
    data = Object.keys(data).sort().map(xVal => ({ x: xVal, ...data[xVal] }));

    const stackedData = stack(data);
    y.domain(d3.extent(stackedData.reduce((acc, section) =>
      acc.concat(section.reduce((secAcc, point) =>
        secAcc.concat([point[0], point[1]]), [])), [])));

    const layer = gChart
      .selectAll('.layer')
      .data(stackedData);

    layer
      .enter()
      .append('path')
      .attr('class', 'area')
      .style('fill', d => colors[d.key])
      .attr('d', area)
      .each(function(d) { this._current = d });

    layer
      .transition()
      .duration(this.transitionDuration)
      .attrTween('d', function(d,i,a) {
        console.log(d,i,a);
        const interpolate = d3.interpolateObject(d,a);
        return t => area(interpolate(t))
      });

    const xAxis = d3.axisBottom(x)
      .ticks(xAxisConf.ticks)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat(xAxisConf.format);
    const yAxis = d3.axisLeft(y)
      .ticks(yAxisConf.ticks)
      .tickSize(0)
      .tickPadding(10)
      .ticks(10)
      .tickFormat(yAxisConf.format);

    gChart
      .append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    gChart
      .append('g')
      .attr('class', 'axis axis-y')
      .call(yAxis);

    this.chart.append('text')
      .attr('class', 'axis-label')
      .attr('x', (height / -2) - margin.top)
      .attr('y', 2)
      .attr('transform', 'rotate(-90)')
      .attr("dy", "12")
      .style('text-anchor', 'middle')
      .text(yAxisConf.label);

    this.chart.append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2 + margin.left)
      .attr('y', height + margin.top + margin.bottom - 22)
      .attr("dy", "12")
      .style('text-anchor', 'middle')
      .text(xAxisConf.label);

    if (!chartData.length) {
      const placeholder = gChart.append('g')
      placeholder.append('text')
        .attr('class', 'missing-data')
        .attr('x', width / 2)
        .attr('y', height / 2 - 12)
        .attr("dy", "12")
        .style('text-anchor', 'middle')
        .text('Oops! We can\'t find this data right now.');
      placeholder.append('text')
        .attr('class', 'missing-data')
        .attr('x', width / 2)
        .attr('y', height / 2 + 12)
        .attr("dy", "12")
        .style('text-anchor', 'middle')
        .text('Please try again later.');
    }

    /*
    this.legend.selectAll('*').remove();
    drawLegend(this.legend, this.color, keys);
    */
  }

}
