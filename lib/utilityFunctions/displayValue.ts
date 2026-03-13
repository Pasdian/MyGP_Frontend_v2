export const displayValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};
