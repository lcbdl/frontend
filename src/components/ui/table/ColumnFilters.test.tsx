import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { Column } from "@tanstack/solid-table";
import { describe, expect, it, vi } from "vitest";
import { ColumnFilters } from "./ColumnFilters";

describe("ColumnFilters", () => {
  const mockSetColumnFilters = vi.fn();
  const mockColumn = {
    id: "name",
    getIndex: () => 0,
    columnDef: {
      header: "Name",
      filterFn: undefined,
    },
  } as Column<any, any>;

  const defaultProps = {
    columnFilters: () => [{ id: "name", value: "Alice" }],
    setColumnFilters: mockSetColumnFilters,
    columns: [mockColumn],
  };

  it("renders filter button with correct count", () => {
    render(() => <ColumnFilters {...defaultProps} />);
    expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens panel when filter button is clicked", async () => {
    render(() => <ColumnFilters {...defaultProps} />);
    const button = screen.getByRole("button", { name: /filters/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("shows text input filter for default column", async () => {
    render(() => <ColumnFilters {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /filters/i }));
    const input = await screen.findByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Alice");
  });

  it("applies filters and closes dialog", async () => {
    render(() => <ColumnFilters {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /filters/i }));
    const applyBtn = await screen.findByRole("button", { name: /applyFilters/i });
    fireEvent.click(applyBtn);
    await waitFor(() => {
      expect(mockSetColumnFilters).toHaveBeenCalledWith([{ id: "name", value: "Alice" }]);
    });
  });
});
