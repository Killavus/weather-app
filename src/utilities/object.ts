export function compact(object: { [k: string]: any }) {
  return Object.entries(object).reduce(
    (
      compacted: { [k: string]: any },
      [key, value]: [key: string, value: any]
    ) => {
      if (value !== undefined) {
        compacted[key] = value;
      }

      return compacted;
    },
    {}
  );
}
