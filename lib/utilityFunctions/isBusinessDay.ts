import Holidays from "date-holidays";
const hd = new Holidays("MX"); // For Mexico

// This function only receives an ISO Date

export function isBusinessDay(d: string) {
  const date = new Date(d);
  const day = date.getDay();
  return day !== 0 && day !== 6 && !hd.isHoliday(date);
}
