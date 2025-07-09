import { businessDaysDiffWithHolidays } from "./businessDaysDiffWithHolidays";

export function shouldPutExceptionCode({
  exceptionCode,
  initialDate,
  finalDate,
}: {
  exceptionCode: string | undefined;
  initialDate: string | undefined;
  finalDate: string | undefined;
}) {
  if (exceptionCode && initialDate && finalDate) {
    const diff = businessDaysDiffWithHolidays(
      new Date(initialDate),
      new Date(finalDate)
    );

    return diff <= 1; // return true if diff <= 1 else false
  }
  return false;
}
