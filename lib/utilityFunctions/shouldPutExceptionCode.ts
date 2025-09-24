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
  if (!exceptionCode && initialDate && finalDate) {
    const diff = businessDaysDiffWithHolidays(
      new Date(initialDate),
      new Date(finalDate)
    );

    return diff <= numDays; // true if within allowed days
  }
  return false;
}
