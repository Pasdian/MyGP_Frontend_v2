import { businessDaysDiffWithHolidays } from "./businessDaysDiffWithHolidays";

export function doesDateKPIBreak({
  exceptionCode,
  initialDate,
  finalDate,
  numDays,
}: {
  exceptionCode: string | undefined;
  initialDate: string | undefined;
  finalDate: string | undefined;
  numDays: number;
}) {
  if (!exceptionCode && initialDate && finalDate) {
    const diff = businessDaysDiffWithHolidays(
      new Date(initialDate),
      new Date(finalDate)
    );
    return diff > numDays; // return true if diff > 1 else false
  }
  return false;
}
