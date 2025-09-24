import { businessDaysDiffWithHolidays } from "./businessDaysDiffWithHolidays";

export function shouldPutExceptionCode({
  exceptionCode,
  initialDate,
  finalDate,
  numDays,
}: {
  exceptionCode: string | undefined | null;
  initialDate: string | undefined | null;
  finalDate: string | undefined | null;
  numDays: number;
}) {
  if (exceptionCode && initialDate && finalDate) {
    const start = new Date(initialDate);
    const end = new Date(finalDate);

    if (end < start) return false;

    const diff = businessDaysDiffWithHolidays(start, end);

    return diff <= numDays;
  }
  return false;
}
