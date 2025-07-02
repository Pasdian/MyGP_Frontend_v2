import Holidays from "date-holidays";
const hd = new Holidays("MX"); // For Mexico

// This function only receives an ISO Date

export function isBusinessDay(isoDateStr: string) {
  const date = new Date(isoDateStr + "T00:00:00");
  const day = date.getDay();
  return day !== 0 && day !== 6 && !hd.isHoliday(date);
}
