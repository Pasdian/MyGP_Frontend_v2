const MEXICAN_HOLIDAYS = [
  "2025-01-01", // New Year's Day
  "2025-02-05", // Constitution Day
  "2025-03-17", // Benito Juarez Day (Observed)
  "2025-05-01", // Labor Day
  "2025-09-16", // Independence Day
  "2025-11-17", // Revolution Day (Observed)
  "2025-12-25", // Christmas Day
];

function businessDaysDiffWithHolidays(startDate: Date, endDate: Date) {
  let count = 0;
  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 1); // Start from next day

  while (currentDate <= endDate) {
    const day = currentDate.getDay();
    const formattedDate = currentDate.toISOString().slice(0, 10);

    if (day !== 0 && day !== 6 && !MEXICAN_HOLIDAYS.includes(formattedDate)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

export { businessDaysDiffWithHolidays };
