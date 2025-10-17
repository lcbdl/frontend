import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "./slider";

describe("Slider", () => {
  it("renders with default props", () => {
    const { getByRole } = render(() => <Slider />);
    const input = getByRole("slider") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("0");
    expect(input.min).toBe("0");
    expect(input.max).toBe("100");
    expect(input.step).toBe("1");
  });

  it("renders with custom min, max, step, and initialValue", () => {
    const { getByRole } = render(() => <Slider min={10} max={50} step={5} value={20} />);
    const input = getByRole("slider") as HTMLInputElement;
    expect(input.min).toBe("10");
    expect(input.max).toBe("50");
    expect(input.step).toBe("5");
    expect(input.value).toBe("20");
  });

  it("calls onInput and onChange with correct value", async () => {
    const onInput = vi.fn();
    const onChange = vi.fn();
    const { getByRole } = render(() => <Slider min={0} max={10} value={5} onInput={onInput} onChange={onChange} />);
    const input = getByRole("slider") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "7" } });
    expect(onInput).toHaveBeenCalledWith(7);
    await fireEvent.change(input, { target: { value: "8" } });
    expect(onChange).toHaveBeenCalledWith(8);
  });

  it("updates value when initialValue prop changes", async () => {
    let value = 10;
    const { getByRole, unmount } = render(() => <Slider min={0} max={20} value={value} />);
    const input = getByRole("slider") as HTMLInputElement;
    expect(input.value).toBe("10");
    value = 15;
    unmount();
    const { getByRole: getByRole2 } = render(() => <Slider min={0} max={20} value={value} />);
    const input2 = getByRole2("slider") as HTMLInputElement;
    expect(input2.value).toBe("15");
  });

  it("disables input when disabled prop is true", () => {
    const { getByRole } = render(() => <Slider disabled />);
    const input = getByRole("slider") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies custom class names", () => {
    const { container } = render(() => (
      <Slider
        class="custom-slider"
        trackClass="custom-track"
        processTrackClass="custom-process"
        thumbClass="custom-thumb"
      />
    ));
    expect(container.querySelector(".custom-slider")).toBeInTheDocument();
    expect(container.querySelector(".custom-track")).toBeInTheDocument();
    expect(container.querySelector(".custom-process")).toBeInTheDocument();
    expect(container.querySelector(".custom-thumb")).toBeInTheDocument();
  });

  it("shows correct progress track width", () => {
    const { container } = render(() => <Slider min={0} max={100} value={50} />);
    const progress = container.querySelector("div.bg-blue-600") as HTMLDivElement;
    expect(progress.style.width).toBe("50%");
  });

  it("shows correct thumb position", () => {
    const { container } = render(() => <Slider min={0} max={100} value={25} />);
    const thumb = container.querySelector("div[style*='left']") as HTMLDivElement;
    expect(thumb.style.left).toContain("25%");
  });

  it("shows focus styles on thumb when focused", async () => {
    const { getByRole, container } = render(() => <Slider />);
    const input = getByRole("slider") as HTMLInputElement;
    const thumb = container.querySelector("div[style*='left']") as HTMLDivElement;
    await fireEvent.focus(input);
    expect(thumb.className).toMatch(/ring-4/);
    await fireEvent.blur(input);
    expect(thumb.className).not.toMatch(/ring-4/);
  });
});
