
export default function grammaticList(input, options = {}) {

  // Set and override default values
  const defaults = {
    period: false,
    conjunction: 'and',
    stringDelimiter: ',',
  };

  Object.keys(options).forEach(key => {
    defaults[key] = options[key];
  });


  if (typeof input === 'string') {
    input = input.split(defaults.stringDelimiter);

    if (input[input.length - 1] === '') {
      input.pop(); // Remove trailing comma
    }
  }

  if (input.length !== 1) {
    let lastComparison = input.pop();

    if (input.length !== 0) {
      lastComparison = ` ${defaults.conjunction} ${lastComparison}`;
    }

    if (input.length === 1) {
      lastComparison = `${input.pop()}${lastComparison}`;
    }

    input.push(lastComparison);
  }

  if (defaults.period) {
    input[input.length - 1] += '.';
  }

  return input.map(x => x.trim()).join(', ');
}
