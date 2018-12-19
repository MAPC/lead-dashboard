import capitalize from './capitalize';


export function maxToMargin(maxValue) {
  if (!maxValue) { return 0; }
  const zeros = Math.floor(Math.log10(maxValue)) + 1;
  const fromZeros = zeros * 6;
  const fromCommas = Math.floor(Math.max(0, zeros - 1) / 3) * 5;
  return fromZeros + fromCommas;
}

export function maxTextToMargin(maxLength, fontSize) {
  if (!maxLength) { return 0; }
  return maxLength * fontSize * 0.56;
}

export function splitPhrase(phrase, charPerLine) {
  if (!phrase) { return []; }

  const words = phrase.split(' ');
  const rows = [];
  let count = 0;
  let rowBuffer = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (count + word.length < charPerLine) {
      count += word.length;
      rowBuffer.push(word);
    } else {
      count = 0;
      rows.push(rowBuffer.join(' '));
      rowBuffer = [word];
    }
  }
  if (rowBuffer.length) {
    rows.push(rowBuffer.join(' '));
  }
  return rows;
}

const addLegendColumn = (legend, color, keysInColumn, formatter) => {
  const group = legend.append('div').attr('class', 'legend-column');

  const sector = capitalize((keysInColumn[0] || '').split('-')[0]);
  group
    .append('h5')
    .text(sector)

  const li = group.append('ul')
    .selectAll('li')
    .data(keysInColumn)
    .enter()
    .append('li');

  li.append('svg')
    .attr('height', '1em')
    .attr('width', '1em')
    .attr('class', 'color-patch')
    .append('circle')
    .attr('cx', '0.5em')
    .attr('cy', '0.5em')
    .attr('r', '0.5em')
    .attr('height', '1em')
    .attr('width', '1em')
    .attr('fill', d => color(d));

  li.append('span')
    .attr('class', 'label')
    .text(d => formatter ? formatter(d) : d);
};

export function drawLegend(legend, color, keys, formatter) {
  if (keys.length >= 6) {
    legend.attr('class', 'legend three-column');
    addLegendColumn(legend, color, keys.slice(0, 2), formatter);
    addLegendColumn(legend, color, keys.slice(2, 4), formatter);
    addLegendColumn(legend, color, keys.slice(4,6), formatter);
  } else {
    addLegendColumn(legend, color, keys, formatter);
  }
}

export function sortKeys(values) {
  const sortedDups = values
    .map(d => ({ z: d.z, order: d.order }))
    .sort((a, b) => {
      const aVal = a.order == undefined ? a.label : a.order;
      const bVal = b.order == undefined ? b.label : b.order;
      return (aVal > bVal) ? 1 : ((aVal < bVal) ? -1 : 0);
    })
    .map(d => d.z);
  return [...(new Set(sortedDups))];
}
