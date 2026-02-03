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
  // 1) Si ya hay código, nunca exigirlo
  if (exceptionCode) return false;

  // 2) Validar fechas
  if (!initialDate || !finalDate) return false;

  const start = new Date(initialDate);
  const end = new Date(finalDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  if (end < start) return false;

  // 3) Calcular diferencia en días hábiles
  const diff = businessDaysDiffWithHolidays(start, end);

  // 4) Exigir código solo si la diferencia excede el umbral
  return diff > numDays; // true => debe poner exceptionCode
}
