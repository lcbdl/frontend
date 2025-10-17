import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination.tsx";

describe("<Pagination />", () => {
  it("renders all pages when totalPages <= 7", () => {
    const onPageChange = vi.fn();
    render(() => <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }

    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });

  it("renders ellipsis when totalPages > 7", () => {
    const onPageChange = vi.fn();
    render(() => <Pagination currentPage={4} totalPages={10} onPageChange={onPageChange} />);

    expect(screen.getAllByText("...").length).toBeGreaterThan(0);
    expect(screen.getByText("5").parentElement).toHaveClass("bg-gray-800"); // currentPage = 4 (zero-based)
  });

  it("disables Previous button on first page", () => {
    const onPageChange = vi.fn();
    render(() => <Pagination currentPage={0} totalPages={10} onPageChange={onPageChange} />);
    const prevButton = screen.getByRole("button", { name: /prevPage/i });
    const nextButton = screen.getByRole("button", { name: /nextPage/i });
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it("disables Next button on last page", () => {
    const onPageChange = vi.fn();
    render(() => <Pagination currentPage={9} totalPages={10} onPageChange={onPageChange} />);
    const prevButton = screen.getByRole("button", { name: /prevPage/i });
    const nextButton = screen.getByRole("button", { name: /nextPage/i });
    expect(nextButton).toBeDisabled();
    expect(prevButton).not.toBeDisabled();
  });

  it("calls onPageChange when number button clicked", async () => {
    const onPageChange = vi.fn();
    render(() => <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    const page4 = screen.getByText("4");
    await fireEvent.click(page4);

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("does not call onPageChange for current page", async () => {
    const onPageChange = vi.fn();
    render(() => <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    const page3 = screen.getByText("3");
    await fireEvent.click(page3);

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("calls onPageChange when Previous/Next buttons are clicked", async () => {
    const onPageChange = vi.fn();
    render(() => <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    const prevButton = screen.getByRole("button", { name: /prevPage/i });
    await fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(1);

    await fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
