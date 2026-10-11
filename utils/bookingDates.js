const INDIA_TIME_ZONE = "Asia/Kolkata";
const INDIA_OFFSET = "+05:30";
const DAY_MS = 24 * 60 * 60 * 1000;

function indiaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => ["year", "month", "day"].includes(part.type))
      .map((part) => [part.type, part.value])
  );
}

function parseIndiaCalendarDate(value) {
  if (typeof value !== "string") return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return null;

  return new Date(`${value}T00:00:00.000${INDIA_OFFSET}`);
}

function todayInIndia() {
  const { year, month, day } = indiaDateParts();
  return parseIndiaCalendarDate(`${year}-${month}-${day}`);
}

function todayInputValue() {
  const { year, month, day } = indiaDateParts();
  return `${year}-${month}-${day}`;
}

function numberOfNights(checkIn, checkOut) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / DAY_MS);
}

module.exports = {
  parseIndiaCalendarDate,
  todayInIndia,
  todayInputValue,
  numberOfNights,
};
