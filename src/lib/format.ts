// Everything is shown in Asia/Dhaka time, whatever the visitor's own time
// zone: a load-shedding slot at 19:00 means 19:00 where the power goes out.

const TIME_ZONE = "Asia/Dhaka";
const LOCALE = "en-GB";

type DateInput = string | number | Date;

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "9 Oct 2026" */
export const formatDate = (value: DateInput) => dateFormatter.format(toDate(value));

/** "Fri, 9 Oct" */
export const formatShortDate = (value: DateInput) => shortDateFormatter.format(toDate(value));

/** "9 Oct" (for chart axes) */
export const formatDayMonth = (value: DateInput) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, day: "numeric", month: "short" }).format(
    toDate(value),
  );

/** "19:00" */
export const formatTime = (value: DateInput) => timeFormatter.format(toDate(value));

/** "9 Oct 2026, 19:00" */
export const formatDateTime = (value: DateInput) => `${formatDate(value)}, ${formatTime(value)}`;

/** "19:00 – 20:00" */
export const formatTimeRange = (start: DateInput, end: DateInput) =>
  `${formatTime(start)} – ${formatTime(end)}`;

/** "2026-10-09": the calendar day in Dhaka, for grouping and for date inputs. */
export const toDhakaDay = (value: DateInput) => dayKeyFormatter.format(toDate(value));

/** "2026-10": the calendar month in Dhaka. */
export const toDhakaMonth = (value: DateInput) => toDhakaDay(value).slice(0, 7);

/** "2026-10" → "October 2026" */
export const formatMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, monthNumber - 1, 1)),
  );
};

/** "2026-10" → "Oct" (for chart axes) */
export const formatMonthShort = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Intl.DateTimeFormat(LOCALE, { month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, monthNumber - 1, 1)),
  );
};

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const RELATIVE_STEPS: [limitSeconds: number, divisor: number, unit: Intl.RelativeTimeFormatUnit][] =
  [
    [60, 1, "second"],
    [3600, 60, "minute"],
    [86_400, 3600, "hour"],
    [2_592_000, 86_400, "day"],
    [31_536_000, 2_592_000, "month"],
    [Number.POSITIVE_INFINITY, 31_536_000, "year"],
  ];

/** "3 hours ago", "in 2 days", relative to `now`. */
export const formatRelative = (value: DateInput, now: DateInput = new Date()) => {
  const seconds = Math.round((toDate(value).getTime() - toDate(now).getTime()) / 1000);
  const magnitude = Math.abs(seconds);

  for (const [limit, divisor, unit] of RELATIVE_STEPS) {
    if (magnitude < limit) {
      return relativeFormatter.format(Math.round(seconds / divisor), unit);
    }
  }

  return formatDate(value);
};

/** 135 → "2 h 15 min", 45 → "45 min" */
export const formatDuration = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined) {
    return "—";
  }

  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;

  if (hours === 0) {
    return `${rest} min`;
  }

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

const moneyFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** "1845.90" → "৳1,845.90" */
export const formatMoney = (amount: string | number) => `৳${moneyFormatter.format(Number(amount))}`;

/** 18877.96 → "৳18.9K", for stat tiles and chart axes */
export const formatMoneyCompact = (amount: string | number) =>
  `৳${compactFormatter.format(Number(amount))}`;

export const formatNumber = (value: number) => new Intl.NumberFormat("en").format(value);

/** "8.50" → "8.5 MW" */
export const formatMW = (value: string | number) =>
  `${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(Number(value))} MW`;

/** "Nusrat Jahan" → "NJ" */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/** "LOAD_SHEDDING" → "Load shedding" */
export const humanize = (value: string) => {
  const text = value.replaceAll("_", " ").toLowerCase();

  return text.charAt(0).toUpperCase() + text.slice(1);
};
