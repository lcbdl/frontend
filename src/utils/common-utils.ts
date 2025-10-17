import dayjs from "dayjs";

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatTime = (timeStr?: string) => {
  const time = timeStr ? dayjs(timeStr.replace(/[+-]\d{4}$/, "")) : null;
  return time?.format("MMMM DD, YYYY HH:mm");
};

export const zeroPad = (num: number, places: number) => {
  return String(num).padStart(places, "0");
};

export const toOrdinal = (num?: number) => {
  if (num === undefined) {
    return "";
  }
  const suffixes = ["th", "st", "nd", "rd"];
  const value = num % 100;
  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
};

export const daysInMonth = (month?: number, year?: number): number => {
  if (month === undefined || year === undefined) {
    return 31; // Default to 31 days
  }
  const date = new Date(year, month, 0);
  return date.getDate();
};

export const getFocusableElements = (container: HTMLElement) => {
  return Array.from(
    container.querySelectorAll(
      'button:not([tabindex="-1"]):not([aria-disabled="true"]), [href], input, select, textarea',
    ),
  )
    .filter((el) => !el.hasAttribute("disabled"))
    .map((ele) => ele as HTMLElement);
};

// Uses normalize('NFD') to decompose accented characters, then removes the
// accent marks with a regex, and converts to lowercase.
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};
