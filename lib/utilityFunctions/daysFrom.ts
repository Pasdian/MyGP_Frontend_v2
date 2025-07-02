export function daysFrom(dateA: string, dateB: string) {
  const diffBetweenDates = +new Date(dateA) - +new Date(dateB);

  const diffInDays = diffBetweenDates / (1000 * 60 * 60 * 24);
  return diffInDays;
}
