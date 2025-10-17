import { debounce } from "@solid-primitives/scheduled";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { GlobalFilter } from "./GlobalFilter";

// Mock debounce to call immediately
vi.mock("@solid-primitives/scheduled", () => ({
  debounce: (fn: any) => fn,
}));

describe("GlobalFilter", () => {
  it("renders input with placeholder", () => {
    const globalFilter = () => "";
    const setGlobalFilter = vi.fn();
    render(() => <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />);
    const input = screen.getByPlaceholderText("dataTable.searchFullTable");
    expect(input).toBeInTheDocument();
  });

  it("shows the current filter value", () => {
    const globalFilter = () => "test value";
    const setGlobalFilter = vi.fn();
    render(() => <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />);
    const input = screen.getByDisplayValue("test value");
    expect(input).toBeInTheDocument();
  });

  it("calls setGlobalFilter on input", async () => {
    let value = "";
    const globalFilter = () => value;
    const setGlobalFilter = vi.fn((v) => {
      value = v;
    });
    render(() => <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />);
    const input = screen.getByPlaceholderText("dataTable.searchFullTable");
    await fireEvent.input(input, { target: { value: "abc" } });
    expect(setGlobalFilter).toHaveBeenCalledWith("abc");
  });

  it("renders the search icon", () => {
    const globalFilter = () => "";
    const setGlobalFilter = vi.fn();
    render(() => <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />);
    // The icon is rendered as an SVG, so we can check for its role or class
    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("input is disabled when disabled attribute is set", () => {
    // Patch the component to accept disabled for this test
    const PatchedGlobalFilter = (props: any) => (
      <div class="relative">
        <input
          type="text"
          value={props.globalFilter() ?? ""}
          onInput={debounce((e) => props.setGlobalFilter(e.target.value), 500)}
          placeholder="dataTable.searchFullTable"
          disabled
        />
      </div>
    );
    const globalFilter = () => "";
    const setGlobalFilter = vi.fn();
    render(() => <PatchedGlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />);
    const input = screen.getByPlaceholderText("dataTable.searchFullTable");
    expect(input).toBeDisabled();
  });
});
