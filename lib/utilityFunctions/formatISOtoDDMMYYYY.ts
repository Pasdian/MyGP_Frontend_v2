// This function only receives dates with ISO Format
export const formatISOtoDDMMYYYY = (d: string): string => {
  const date = d.split("T")[0];
  const splittedDate = date.split("-");

  const day = splittedDate[2];
  const month = splittedDate[1];
  const year = splittedDate[0];
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};
