export default function maxRowByKey(arr, key) {
  let max = -1;
  let maxIndex = null;

  arr.forEach((row, index) => {
    if (row[key] > max) {
      max = row[key];
      maxIndex = index; 
    }
  });

  return {row: arr[maxIndex], index: maxIndex};
}
