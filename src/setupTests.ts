import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("i18next", () => ({
  default: {
    t: (key: string) => key,
    use: vi.fn(),
  },
}));

vi.mock("@/i18n", () => ({
  default: { language: "en", t: (key: string) => key },
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
