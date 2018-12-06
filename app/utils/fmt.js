const notNothing = (d) => (typeof(d) != 'undefined' && d != null);

const base = {
  string: {
    blank: () => '',
    default: (d) => (notNothing(d) ? String(d) : ''),
  },

  number: {
    thousands: (d) => (notNothing(d) ? `${(d/1000).toFixed(0)}k` : ''),
    percentage: (d) => (notNothing(d) ? `${d * 100}%` : ''),
    integer: (d) => (notNothing(d) ? d.toFixed(0) : ''),
    nearestTenth: (d) => (notNothing(d) ? d.toFixed(1) : ''),
    ignoreFloat: (d) => ((notNothing(d) && d % 1 == 0) ? d.toFixed(0) : ''),
    integerPercentage: (d) => (notNothing(d) ? `${(d*100).toFixed(0)}%` : ''),
    localeString: (d) => (notNothing(d) ? d.toLocaleString() : ''),
  },
};

const fmt = {
  number: {
    dollar: (d) => (notNothing(d) ? `$${base.number.localeString(d)}` : ''),
    ...base.number,
  },
  string: base.string,
};


export default fmt;
