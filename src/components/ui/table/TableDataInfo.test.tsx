import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { TableDataInfo } from "./TableDataInfo";

describe("TableDataInfo", () => {
  it("renders showing entries info when there are filtered rows", () => {
    render(() => (
      <TableDataInfo startIndex={() => 1} endIndex={() => 10} totalFilteredRows={() => 10} totalRowsCount={() => 100} />
    ));
    expect(screen.getByText("dataTable.showingEntries")).toBeInTheDocument();
  });

  it("renders nothing when totalFilteredRows is 0 but totalRowsCount is not 0", () => {
    render(() => (
      <TableDataInfo startIndex={() => 0} endIndex={() => 0} totalFilteredRows={() => 0} totalRowsCount={() => 10} />
    ));
    // Should not show "Showing..." or "dataTable.noEntriesFound"
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    expect(screen.queryByText("dataTable.noEntriesFound")).not.toBeInTheDocument();
  });

  it("renders dataTable.noEntriesFound when totalRowsCount is 0", () => {
    render(() => (
      <TableDataInfo startIndex={() => 0} endIndex={() => 0} totalFilteredRows={() => 0} totalRowsCount={() => 0} />
    ));
    expect(screen.getByText("dataTable.noEntriesFound")).toBeInTheDocument();
  });

  it("renders showing entries info when filtered rows less than total", () => {
    render(() => (
      <TableDataInfo startIndex={() => 11} endIndex={() => 20} totalFilteredRows={() => 10} totalRowsCount={() => 20} />
    ));
    expect(screen.getByText("dataTable.showingEntries")).toBeInTheDocument();
  });

  it("renders showing entries info when filtered rows equals total", () => {
    render(() => (
      <TableDataInfo startIndex={() => 1} endIndex={() => 5} totalFilteredRows={() => 5} totalRowsCount={() => 5} />
    ));
    expect(screen.getByText("dataTable.showingEntries")).toBeInTheDocument();
  });
});
