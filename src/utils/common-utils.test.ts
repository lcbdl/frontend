import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { daysInMonth, delay, formatTime, getFocusableElements, toOrdinal, zeroPad } from "./common-utils";

describe("delay", () => {
  it("resolves after the specified timeout", async () => {
    vi.useFakeTimers();
    const promise = delay(500);

    vi.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe("formatTime", () => {
  it("format time into desired format", () => {
    expect(formatTime("2025-04-24T03:45:00+0000")).toEqual("April 24, 2025 03:45");
    expect(formatTime("2025-04-15T00:00:00Z")).toEqual("April 15, 2025 00:00");
  });
});

describe("zeroPad", () => {
  it("should pad numbers with leading zeros", () => {
    expect(zeroPad(5, 2)).toBe("05");
    expect(zeroPad(123, 5)).toBe("00123");
    expect(zeroPad(0, 3)).toBe("000");
    expect(zeroPad(12345, 3)).toBe("12345");
  });

  it("should return the number as a string if it's already padded", () => {
    expect(zeroPad(5, 1)).toBe("5");
    expect(zeroPad(123, 3)).toBe("123");
  });
});

describe("toOrdinal", () => {
  it("should convert numbers to ordinal strings", () => {
    expect(toOrdinal(1)).toBe("1st");
    expect(toOrdinal(2)).toBe("2nd");
    expect(toOrdinal(3)).toBe("3rd");
    expect(toOrdinal(4)).toBe("4th");
    expect(toOrdinal(5)).toBe("5th");
    expect(toOrdinal(6)).toBe("6th");
    expect(toOrdinal(7)).toBe("7th");
    expect(toOrdinal(8)).toBe("8th");
    expect(toOrdinal(9)).toBe("9th");
    expect(toOrdinal(10)).toBe("10th");
    expect(toOrdinal(11)).toBe("11th");
    expect(toOrdinal(12)).toBe("12th");
    expect(toOrdinal(13)).toBe("13th");
    expect(toOrdinal(21)).toBe("21st");
    expect(toOrdinal(22)).toBe("22nd");
    expect(toOrdinal(23)).toBe("23rd");
  });
});

describe("daysInMonth", () => {
  it("should return correct number of days for each month", () => {
    expect(daysInMonth(1, 2024)).toBe(31); // January
    expect(daysInMonth(2, 2024)).toBe(29); // February (leap year)
    expect(daysInMonth(2, 2023)).toBe(28); // February (non-leap year)
    expect(daysInMonth(4, 2023)).toBe(30); // April
    expect(daysInMonth(12, 2023)).toBe(31); // December
  });

  it("should return 31 if month or year is undefined", () => {
    expect(daysInMonth(undefined, 2023)).toBe(31);
    expect(daysInMonth(2, undefined)).toBe(31);
    expect(daysInMonth(undefined, undefined)).toBe(31);
  });
});

describe("getFocusableElements", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.innerHTML = `
      <button id="btn1"></button>
      <button id="btn2" tabindex="-1"></button>
      <button id="btn3" aria-disabled="true"></button>
      <button id="btn4" disabled></button>
      <a id="link1" href="#"></a>
      <input id="input1" />
      <select id="select1"></select>
      <textarea id="textarea1"></textarea>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should return only focusable elements", () => {
    const focusable = getFocusableElements(container);
    const ids = focusable.map((el) => el.id);
    expect(ids).toContain("btn1");
    expect(ids).toContain("link1");
    expect(ids).toContain("input1");
    expect(ids).toContain("select1");
    expect(ids).toContain("textarea1");
    expect(ids).not.toContain("btn2");
    expect(ids).not.toContain("btn3");
    expect(ids).not.toContain("btn4");
  });

  it("should return empty array if no focusable elements", () => {
    const emptyDiv = document.createElement("div");
    expect(getFocusableElements(emptyDiv)).toEqual([]);
  });
});
