export function isCurrentYear(date: string) {
  const currentYear = new Date().getFullYear();
  return new Date(date).getFullYear() == currentYear;
}
