// These are words or characters that would be innappropriate
// to consider including in an acronym.
const omittable = ['a', 'of', 'and', 'at', 'for', '&'];
const abbreviatable = ['north', 'south', 'east', 'west', 'central'];


export default function acronyze(phrase) {
  const words = (phrase || '').split(' ');

  if (words.length == 2 && phrase.length >= 15) {
    return words.map(word => (abbreviatable.indexOf(word.toLowerCase()) !== -1) ? `${word.charAt(0).toUpperCase()}. ` : word).join('');
  }
  else if (words.length >= 3) {
    const letters = words.map(word => {
      if (omittable.indexOf(word.toLowerCase()) === -1) {
        return word.charAt(0).toUpperCase();
      }
    });

    const acronym = letters.join('');

    return acronym;
  }
  else {
    return phrase;
  }
}
