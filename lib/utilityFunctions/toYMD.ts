// Receives a date and formats it to yyyy-mm-dd
export const toYMD = (date: Date | undefined) =>
  date ? date.toISOString().slice(0, 10) : undefined;
