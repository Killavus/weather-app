export function statisticalMode<T>(values: T[]): T | null {
  if (values.length === 0) {
    return null;
  }

  const histogram = new Map();

  values.forEach((value) => {
    const count = histogram.get(value) || 0;
    histogram.set(value, count + 1);
  });

  let currentMax: number = 0;
  let maxValue: T = values[0];

  for (const [value, count] of histogram.entries()) {
    if (count > currentMax) {
      currentMax = count;
      maxValue = value;
    }
  }

  return maxValue;
}
