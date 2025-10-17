import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { TextArea } from "./text-area-field";

describe("TextArea Component", () => {
  it("renders with a label", () => {
    render(() => <TextArea name="comments" label="Comments" />);
    expect(screen.getByLabelText("Comments")).toBeInTheDocument();
  });

  it("binds the value correctly", () => {
    render(() => <TextArea name="comments" label="Comments" value="Hello world" />);
    const textarea = screen.getByLabelText("Comments") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Hello world");
  });

  it("renders required asterisk visually but hides it from screen readers", () => {
    render(() => <TextArea name="bio" label="Bio" required />);
    const label = screen.getByText("*");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("aria-hidden", "true");
  });

  it("applies error message and accessibility attributes", () => {
    render(() => <TextArea name="description" label="Description" error="This field is required" />);

    const textarea = screen.getByLabelText("Description");
    const error = screen.getByText("This field is required");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-errormessage", "description-error");
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute("id", "description-error");
  });

  it("respects disabled state and sets aria-disabled", () => {
    render(() => <TextArea name="notes" label="Notes" disabled />);
    const textarea = screen.getByLabelText("Notes");

    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute("aria-disabled", "true");
  });

  it("fires input events and allows typing", async () => {
    render(() => <TextArea name="feedback" label="Feedback" />);
    const textarea = screen.getByLabelText("Feedback") as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: "New value" } });

    expect(textarea.value).toBe("New value");
  });

  it("has a visible focus outline (WCAG-compliant)", async () => {
    render(() => <TextArea name="wcag-test" label="Focus Test" />);
    const textarea = screen.getByLabelText("Focus Test");

    textarea.focus();
    await waitFor(() => {
      expect(document.activeElement).toBe(textarea);
    });

    // Check outline computed style if focus classes aren't used
    const styles = getComputedStyle(textarea);
    expect(styles.outlineStyle !== "none" || styles.boxShadow !== "none").toBe(true);
  });

  it("does not render label if not provided", () => {
    render(() => <TextArea name="no-label" />);
    const textarea = screen.getByRole("textbox");

    expect(textarea).toBeInTheDocument();
    // Confirm there's no label tag
    expect(screen.queryByLabelText(/.+/)).not.toBeInTheDocument();
  });
});
