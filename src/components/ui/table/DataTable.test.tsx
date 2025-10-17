import { fireEvent, render, screen } from "@solidjs/testing-library";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./DataTable";

const queryClient = new QueryClient();

type User = {
  id: number;
  name: string;
  age: number;
};

const columns = [
  {
    header: "ID",
    accessorKey: "id",
    size: 60,
  },
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Age",
    accessorKey: "age",
  },
];

const mockData: User[] = [
  { id: 1, name: "Alice", age: 23 },
  { id: 2, name: "Bob", age: 34 },
  { id: 3, name: "Charlie", age: 29 },
];

describe("DataTable", () => {
  it("renders with static data", () => {
    render(() => (
      <QueryClientProvider client={queryClient}>
        <DataTable columns={columns} data={mockData} enableSorting={true} enablePagination={true} />
      </QueryClientProvider>
    ));

    expect(screen.getByTestId("solid-data-table")).toBeVisible();
    expect(screen.getByText("Alice")).toBeVisible();
    expect(screen.getByText("Bob")).toBeVisible();
  });

  it("renders global filter if enabled", () => {
    render(() => (
      <QueryClientProvider client={queryClient}>
        <DataTable
          columns={columns}
          data={mockData}
          enableSorting={true}
          enableFilters={true}
          enableGlobalFilter={true}
        />
      </QueryClientProvider>
    ));

    expect(screen.getByPlaceholderText("dataTable.searchFullTable")).toBeInTheDocument();
  });

  it("calls fetchFn with correct params in server-side mode", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      rows: mockData,
      totalRows: 3,
    });

    render(() => (
      <QueryClientProvider client={queryClient}>
        <DataTable
          columns={columns}
          fetchFn={fetchFn}
          enableSorting
          enablePagination
          enableFilters
          enableGlobalFilter
        />
      </QueryClientProvider>
    ));

    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        pageIndex: 0,
        pageSize: 10,
        filters: [],
        sortBy: [],
        globalFilter: "",
      }),
    );
  });

  it("shows pagination and updates page on click", async () => {
    const data = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      name: `User ${i}`,
      age: 20 + (i % 10),
    }));

    render(() => (
      <QueryClientProvider client={queryClient}>
        <DataTable columns={columns} data={data} enablePagination pageSize={5} />
      </QueryClientProvider>
    ));

    expect(screen.getByText("User 0")).toBeVisible();
    const nextPageBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextPageBtn);

    expect(screen.queryByText("User 0")).not.toBeInTheDocument();
  });

  it("renders sorting arrows when sorting is enabled", () => {
    render(() => (
      <QueryClientProvider client={queryClient}>
        <DataTable columns={columns} data={mockData} enableSorting />
      </QueryClientProvider>
    ));

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);

    expect(nameHeader.querySelector("svg")).toBeTruthy(); // Up or down arrow appears
  });
});
