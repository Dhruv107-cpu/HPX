export const IST_TIME_ZONE = "Asia/Kolkata";

type DateInput = string | number | Date | null | undefined;

const MONTH_INDEX_BY_SHORT_NAME: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

const parseApiDateString = (value: string): Date | null => {
  const trimmed = value.trim();

  const isoWithTimezone = /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/;
  if (isoWithTimezone.test(trimmed)) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const yyyyMMdd = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (yyyyMMdd) {
    const [, year, month, day, hour = "00", minute = "00", second = "00"] = yyyyMMdd;
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const ddMMyyyy = trimmed.match(
    /^(\d{2})[-/](\d{2})[-/](\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (ddMMyyyy) {
    const [, day, month, year, hour = "00", minute = "00", second = "00"] = ddMMyyyy;
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toValidDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : typeof value === "string" ? parseApiDateString(value) : new Date(value);
  if (!date) return null;
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDateTimeParts = (value: DateInput) => {
  const date = toValidDate(value);
  if (!date) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
};

export const formatISTDate = (value: DateInput, fallback = "-") => {
  const parts = getDateTimeParts(value);
  if (!parts) return fallback;
  return `${parts.day}-${parts.month}-${parts.year}`;
};

export const formatISTDateTime = (value: DateInput, fallback = "-") => {
  const parts = getDateTimeParts(value);
  if (!parts) return fallback;
  return `${parts.day}-${parts.month}-${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
};

export const formatISTTime = (value: DateInput, fallback = "-") => {
  const parts = getDateTimeParts(value);
  if (!parts) return typeof value === "string" && value ? value : fallback;
  return `${parts.hour}:${parts.minute}`;
};

export const formatISTMonthYear = (value: DateInput, fallback = "Unavailable") => {
  const date = toValidDate(value);
  if (!date) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIME_ZONE,
    month: "short",
    year: "numeric",
  }).format(date);
};

export const getISTYear = (value: DateInput, fallback = new Date().getFullYear()) => {
  const parts = getDateTimeParts(value);
  return parts?.year ? Number(parts.year) : fallback;
};

export const formatISTDayMonthWithYear = (
  value: string,
  year: number,
  fallback = value
) => {
  const dayMonth = value.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})$/);
  if (!dayMonth) return formatISTDate(value, fallback);

  const [, day, monthName] = dayMonth;
  const month = MONTH_INDEX_BY_SHORT_NAME[monthName.toLowerCase()];
  if (!month) return fallback;

  return `${day.padStart(2, "0")}-${month}-${year}`;
};

const parseTrendDayMonthTimeAsUtc = (value: string, year: number) => {
  const dayMonthTime = value.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{1,2}):(\d{2})$/);
  if (!dayMonthTime) return null;

  const [, day, monthName, hour, minute] = dayMonthTime;
  const month = MONTH_INDEX_BY_SHORT_NAME[monthName.toLowerCase()];
  if (!month) return null;

  const utcDate = new Date(
    Date.UTC(
      year,
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    )
  );

  return Number.isNaN(utcDate.getTime()) ? null : utcDate;
};

const parseTrendClockTimeAsUtc = (value: string, reference: DateInput) => {
  const clockTime = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  const referenceDate = toValidDate(reference) ?? new Date();
  if (!clockTime) return null;

  const [, hour, minute] = clockTime;
  const utcDate = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
      Number(hour),
      Number(minute)
    )
  );

  return Number.isNaN(utcDate.getTime()) ? null : utcDate;
};

export const formatISTTrendClock = (
  value: string,
  reference: DateInput,
  fallback = value
) => {
  const date = parseTrendClockTimeAsUtc(value, reference);
  if (!date) return formatISTTime(value, fallback);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).format(date);
};

export const formatISTTrendClockDateTime = (
  value: string,
  reference: DateInput,
  fallback = value
) => {
  const date = parseTrendClockTimeAsUtc(value, reference);
  if (!date) return formatISTDateTime(value, fallback);

  return formatISTDateTime(date, fallback);
};

export const formatISTTrendHour = (value: string, year: number, fallback = value) => {
  const date = parseTrendDayMonthTimeAsUtc(value, year);
  if (!date) return formatISTTime(value, fallback);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).format(date);
};

export const formatISTTrendDateTime = (value: string, year: number, fallback = value) => {
  const date = parseTrendDayMonthTimeAsUtc(value, year);
  if (!date) return formatISTDateTime(value, fallback);

  return formatISTDateTime(date, fallback);
};
