import type { DeliverySiteStatusType } from "@/types/DeliverySite";
import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { DeliverySiteStatus } from "./DeliverySiteStatus";

describe("DeliverySiteStatus", () => {
  const testCases: { status?: DeliverySiteStatusType; label: string; classContains: string }[] = [
    { status: "A", label: "Active", classContains: "text-green-900" },
    { status: "I", label: "Inactive", classContains: "text-red-900" },
    { status: "U", label: "Unknown", classContains: "text-gray-900" },
    { status: "C", label: "Classified", classContains: "text-black" },
    { status: undefined, label: "Unknown", classContains: "text-gray-900" },
  ];

  testCases.forEach(({ status, label, classContains }) => {
    it(`renders correctly for status ${status ?? "undefined"}`, () => {
      render(() => <DeliverySiteStatus status={status} />);
      const el = screen.getByText(label);
      expect(el).toBeInTheDocument();
      expect(el.className).toContain(classContains);
      expect(el).toHaveClass("inline-block", "rounded-md", "font-medium");
    });
  });
});
