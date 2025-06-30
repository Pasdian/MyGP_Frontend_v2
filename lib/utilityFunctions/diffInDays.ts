export function diffInDays(dateA: string, dateB: string) {
  const diffBetweenDates = +new Date(dateB) - +new Date(dateA);

  const diffInDays = Math.ceil(diffBetweenDates / (1000 * 60 * 60 * 24));
  return diffInDays;
}
