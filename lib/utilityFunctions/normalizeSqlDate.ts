export function normalizeSqlDate(sqlDate: string) {
  return sqlDate
    .trim() // remove invisible characters
    .replace(/\s+/g, " ") // collapse any weird whitespace
    .replace(" ", "T") // replace space between date + time
    .replace(/\.\d+$/, ""); // remove .0000 etc.
}
