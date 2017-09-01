export default function grammaticList(input) {

  if (typeof input === 'string') {
    input = input.split(',');
  }

  if (input.length !== 1) {
    input.pop(); // Remove trailing comma
    let lastComparison = input.pop() + '.';

    if (input.length !== 0) {
      lastComparison = ` and ${lastComparison}`;
    }

    if (input.length === 1) {
      lastComparison = `${input.pop()}${lastComparison}`;
    }

    input.push(lastComparison);
  }

  return input.join(',');
}
