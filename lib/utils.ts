import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function isIsoDateOnly(date: string) {
  return ISO_DATE_ONLY_PATTERN.test(date);
}

export function toDate(date: string) {
  if (isIsoDateOnly(date)) {
    return new Date(`${date}T00:00:00.000Z`);
  }
  return new Date(date);
}

export function toDateTimestamp(date: string) {
  return toDate(date).getTime();
}

export function formatDate(date: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (isIsoDateOnly(date)) {
    options.timeZone = "UTC";
  }

  return new Intl.DateTimeFormat("ko-KR", options).format(toDate(date));
}
