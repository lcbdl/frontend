import i18n from "@/i18n";
import { cn } from "@/utils/cls-util";
import { normalizeText } from "@/utils/common-utils";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useQuery } from "@tanstack/solid-query";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  createSolidTable,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingFn,
  SortingState,
  VisibilityState,
} from "@tanstack/solid-table";
import { ChevronDown, ChevronUp } from "lucide-solid";
import { createSignal, createUniqueId, For, JSXElement, mergeProps, Show } from "solid-js";
import { ColumnFilters } from "./ColumnFilters";
import { GlobalFilter } from "./GlobalFilter";
import { RangeOption } from "./NumberRangeFilter";
import { Pagination } from "./Pagination";
import { TableDataInfo } from "./TableDataInfo";

export type QueryParams<TData> = {
  pageIndex: number;
  pageSize: number;
  sortBy?: { id: keyof TData; desc: boolean }[];
  filters?: { id: keyof TData; value: string | number }[];
  globalFilter?: string;
};

export interface DataTableProps<TData> {
  id?: string;
  data?: TData[];
  fetchFn?: (params: QueryParams<TData>) => Promise<{
    rows: TData[];
    totalRows: number;
  }>;
  columns: ColumnDef<TData>[];
  enableSorting?: boolean;
  sort?: SortingState;
  enableFilters?: boolean;
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;
  onColumnFilterChange?: (columnFilters: ColumnFiltersState) => void;
  columnFilters?: ColumnFiltersState;
  globalFilter?: string;
  // Pagination options
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  pageIndex?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  columnVisibility?: VisibilityState;
}

//Function for case-insensitive sorting
export const caseInsensitiveSort: SortingFn<any> = (rowA, rowB, columnId) => {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);

  if (typeof a === "string" && typeof b === "string") {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  }

  // Fallback to default if not strings
  return 0;
};

export const DataTable = <TData,>(props: DataTableProps<TData>) => {
  const mergedProps = mergeProps(
    {
      id: createUniqueId(),
      columnVisibility: {},
      // sorting options
      enableSorting: false,
      enableMultiSort: false,
      // Filtering options
      enableFilters: false,
      enableColumnFilters: false,
      enableGlobalFilter: false,
      // Pagination options
      enablePagination: false,
      pageSize: 5,
      pageSizeOptions: [10, 20, 50, 100],
      pageIndex: 0,
    },
    props,
  );

  const [sorting, setSorting] = createSignal<SortingState>(mergedProps.sort || []);
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>(mergedProps.columnFilters || []);
  const [globalFilter, setGlobalFilter] = createSignal<string>(mergedProps.globalFilter || "");
  const [pagination, setPagination] = createSignal({
    pageIndex: mergedProps.pageIndex || 0,
    pageSize:
      mergedProps.pageSize && mergedProps.pageSizeOptions.includes(mergedProps.pageSize)
        ? mergedProps.pageSize
        : mergedProps.pageSizeOptions[0],
  });

  const fuzzyFilter: FilterFn<TData> = (row, _columnId, filterValue, addMeta) => {
    if (!filterValue) return true;

    // Normalize the search value for accent-insensitive matching
    const normalizedFilterValue = normalizeText(String(filterValue));

    // @ts-expect-error ignore this error
    const searchableValues = Object.values(row.original).filter((val) => val != null && val !== "");

    for (const itemValue of searchableValues) {
      const normalizedItem = normalizeText(String(itemValue));

      // Use rankItem on the normalized strings
      const itemRank = rankItem(normalizedItem, normalizedFilterValue);
      if (itemRank.passed && itemRank.rank >= 2) {
        addMeta({ itemRank });
        return true;
      }
    }

    return false;
  };

  const customNumberRangeFn: FilterFn<TData> = (row, columnId, filterValue: RangeOption[]) => {
    const value = row.getValue(columnId);
    if (typeof value !== "number") return false;

    if (filterValue.length === 0) return true;

    const index = filterValue.findIndex((item) => {
      if (item.min !== undefined) {
        return value >= item.min && (item.max === undefined || value < item.max);
      } else {
        return item.max !== undefined && value < item.max;
      }
    });
    return index !== -1;
  };

  const customMultipleSelectionFn: FilterFn<TData> = (row, columnId, filterValue: any[]) => {
    const value = row.getValue(columnId);
    if (filterValue.length === 0) return true;

    const index = filterValue.findIndex((item) =>
      typeof value === "string" ? (item as string).toLowerCase() === value.toLowerCase() : item === value,
    );
    return index !== -1;
  };

  const customAutoSuggestionFn: FilterFn<TData> = (row, columnId, filterValue: any[]) => {
    const value = row.getValue(columnId);
    if (filterValue.length === 0) return true;

    const index = filterValue.findIndex((item) =>
      typeof value === "string" ? (item as string).toLowerCase() === value.toLowerCase() : item === value,
    );
    return index !== -1;
  };

  const getQueryParams = (): QueryParams<TData> => ({
    pageIndex: pagination().pageIndex,
    pageSize: pagination().pageSize,
    sortBy: sorting().map((s) => ({
      id: s.id as keyof TData,
      desc: s.desc,
    })),
    filters: columnFilters().map((filter) => ({
      id: filter.id as keyof TData,
      value: filter.value as string | number,
    })),
    globalFilter: globalFilter(),
  });

  const tableQuery = !!mergedProps.fetchFn
    ? useQuery(() => ({
        queryKey: [`table-data-${mergedProps.id}`, getQueryParams()],
        queryFn: () => mergedProps.fetchFn?.(getQueryParams()),
        keepPreviousData: true, // for smooth pagination
      }))
    : undefined;

  const usingServerSideData = () => !!mergedProps.fetchFn;

  const dataTable = createSolidTable({
    get columns() {
      // Apply case-insensitive sorting
      return mergedProps.columns.map((col) => {
        return {
          ...col,
          sortingFn: caseInsensitiveSort,
        };
      });
    },
    get data() {
      if (mergedProps.data) {
        return mergedProps.data;
      } else if (!!tableQuery) {
        return tableQuery.data?.rows ?? [];
      } else {
        console.error("Please set data or fetchFn property");
        return [];
      }
    },

    initialState: {
      columnVisibility: mergedProps.columnVisibility,
    },

    getCoreRowModel: getCoreRowModel(),
    // Sorting options
    enableSorting: mergedProps.enableSorting,
    enableMultiSort: mergedProps.enableSorting && mergedProps.enableMultiSort,
    isMultiSortEvent:
      mergedProps.enableSorting && mergedProps.enableMultiSort
        ? (e) => {
            const keyEvent = e as KeyboardEvent;
            return keyEvent.shiftKey || keyEvent.metaKey;
          }
        : undefined,
    manualSorting: mergedProps.enableSorting && usingServerSideData(),
    getSortedRowModel: mergedProps.enableSorting && !usingServerSideData() ? getSortedRowModel() : undefined,

    // Filtering options
    enableFilters: mergedProps.enableFilters,
    manualFiltering: mergedProps.enableFilters && usingServerSideData(),
    enableColumnFilters: mergedProps.enableFilters && mergedProps.enableColumnFilters,
    enableGlobalFilter: mergedProps.enableFilters && mergedProps.enableGlobalFilter,
    getFilteredRowModel: mergedProps.enableFilters && !usingServerSideData() ? getFilteredRowModel() : undefined,
    filterFns: {
      fuzzy: fuzzyFilter,
      customNumberRangeFn: customNumberRangeFn,
      customMultipleSelectionFn: customMultipleSelectionFn,
      customAutoSuggestionFn: customAutoSuggestionFn,
    },
    globalFilterFn: fuzzyFilter,
    // Pagination options
    manualPagination: usingServerSideData(),
    pageCount: usingServerSideData() ? Math.ceil((tableQuery?.data?.totalRows ?? 0) / mergedProps.pageSize) : undefined,
    getPaginationRowModel: mergedProps.enablePagination && !usingServerSideData() ? getPaginationRowModel() : undefined,

    onSortingChange: mergedProps.enableSorting
      ? usingServerSideData()
        ? (sortBy) => setSorting(sortBy)
        : setSorting
      : undefined,
    onPaginationChange: mergedProps.enablePagination
      ? usingServerSideData()
        ? (updater) => {
            const next =
              typeof updater === "function"
                ? updater({ pageIndex: pagination().pageIndex, pageSize: pagination().pageSize })
                : updater;

            setPagination({ ...pagination(), pageIndex: next.pageIndex, pageSize: next.pageSize });
          }
        : setPagination
      : undefined,
    onColumnFiltersChange: mergedProps.enableFilters
      ? usingServerSideData()
        ? (filters) => setColumnFilters(filters)
        : setColumnFilters
      : undefined,
    onGlobalFilterChange: mergedProps.enableFilters
      ? usingServerSideData()
        ? (filter) => setGlobalFilter(filter)
        : setGlobalFilter
      : undefined,

    state: {
      get sorting() {
        return mergedProps.enableSorting ? sorting() : [];
      },
      get columnFilters() {
        return mergedProps.enableFilters ? columnFilters() : [];
      },
      get globalFilter() {
        return mergedProps.enableFilters ? globalFilter() : "";
      },
      get pagination() {
        return mergedProps.enablePagination ? pagination() : undefined;
      },
    },

    debugAll: false,
  });

  const filterableColumns = dataTable
    .getHeaderGroups()
    .flatMap((headerGroup) =>
      headerGroup.headers.filter((header) => header.column.getCanFilter()).map((header) => header.column),
    );

  const removeColumnFilter = (columnId: string) => {
    setColumnFilters((prev) => prev.filter((item) => item.id !== columnId));
  };

  const pageIndex = () => dataTable.getState().pagination.pageIndex;
  const pageSize = () => dataTable.getState().pagination.pageSize;

  const totalRowsCount = () =>
    usingServerSideData() ? (tableQuery?.data?.totalRows ?? 0) : dataTable.getPrePaginationRowModel().rows.length;

  const totalPagesCount = () => Math.ceil(totalRowsCount() / pageSize());

  const startIndex = () => (totalPagesCount() === 0 ? 0 : pageIndex() * pageSize() + 1);
  const endIndex = () => Math.min(startIndex() + pageSize() - 1, totalPagesCount());

  const getColumn = (columnId: string, columns: Column<TData, unknown>[]) => columns.find((c) => c.id === columnId);

  const getFilterValueString = (filterValue: unknown, column?: Column<TData, unknown>): string => {
    const filterOptions =
      // @ts-expect-error known custom filter function name
      "customMultipleSelectionFn" === column?.columnDef.filterFn
        ? // @ts-expect-error filter options in meta
          (column.columnDef.meta?.filterOptions as { value: any; label: string }[])
        : undefined;

    if (Array.isArray(filterValue)) {
      const newValues = filterValue.map((v) =>
        !!filterOptions ? filterOptions?.find((item) => item.value === v)?.label : v,
      );
      return newValues.reduce(
        (prev, curr) => prev + (prev.length === 0 ? "" : ", ") + curr,

        "",
      );
    } else {
      return filterValue as string;
    }
  };

  return (
    <div data-testid="solid-data-table">
      <Show when={mergedProps.enableFilters || mergedProps.enableGlobalFilter}>
        <div
          class={cn(
            "mb-3 grid grid-cols-3 items-center gap-x-4 gap-y-3",
            mergedProps.enableGlobalFilter ? "sm:grid-cols-3" : "md:grid-cols-2",
          )}
        >
          <Show when={mergedProps.enableGlobalFilter}>
            <div class="relative order-1 col-span-2 sm:col-span-1">
              <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            </div>
          </Show>
          <div class="order-3 col-span-3 text-sm sm:order-2 sm:col-span-1">
            <TableDataInfo endIndex={endIndex} startIndex={startIndex} totalRowsCount={totalRowsCount} />
          </div>
          <div class="relative order-2 flex justify-end sm:order-3">
            <ColumnFilters
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              columns={filterableColumns}
            />
          </div>
          <div class="order-4 col-span-3 mt-3 mb-1 items-center gap-2 text-sm md:col-span-3">
            <Show when={columnFilters().length > 0}>
              <p class="my-auto mr-2 inline-block pb-2 text-sm leading-4 font-semibold text-gray-600">
                {i18n.t("dataTable.activeFilters")}
              </p>
              <div class="inline-flex flex-wrap gap-2">
                <For each={columnFilters()}>
                  {(filter) => {
                    const thisColumn = getColumn(filter.id, filterableColumns);
                    const header = thisColumn?.columnDef.header as JSXElement;
                    const filterValue = getFilterValueString(filter.value, thisColumn);
                    return (
                      <div class="inline-flex items-center rounded-2xl border border-sky-700 bg-white py-1 pr-1 pl-2.5 text-sm leading-4 font-medium text-sky-700 focus:ring-2 focus:ring-sky-700 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-none">
                        {header} : {filterValue}
                        <button
                          class="ml-1 rounded-full p-0.5 transition hover:bg-sky-700 hover:text-white"
                          aria-label={i18n.t("common.close")}
                          onClick={() => removeColumnFilter(filter.id)}
                        >
                          <svg
                            aria-hidden="true"
                            class="h-3.5 w-3.5"
                            fill="currentColor"
                            viewBox="0 0 384  512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </Show>
      <div class="relative overflow-x-auto rounded-md border border-gray-300 bg-white shadow shadow-gray-500/25 sm:rounded-lg">
        <table class="w-full divide-y divide-gray-300 text-left text-sm">
          <thead>
            <For each={dataTable.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => {
                      return (
                        <th
                          scope="col"
                          colSpan={header.colSpan}
                          class={cn(
                            "py-3.5 pr-3 pl-4 text-left text-base font-semibold text-gray-900 first:sm:pl-5 last:sm:pr-5",
                            header.column.getCanSort() ? "group cursor-pointer select-none" : "",
                          )}
                          style={{
                            width: !header.column.columnDef.size ? "auto" : `${header.column.columnDef.size}px`,
                          }}
                          role="columnheader"
                          aria-sort={
                            header.column.getIsSorted() === "desc"
                              ? "descending"
                              : header.column.getIsSorted() === "asc"
                                ? "ascending"
                                : "none"
                          }
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              role="button"
                              tabIndex={0}
                              class={cn("group inline-flex text-nowrap", {
                                "cursor-pointer": header.column.getCanSort(),
                              })}
                              onClick={header.column.getToggleSortingHandler()}
                              onKeyDown={(e) => e.key === "Enter" && header.column.getToggleSortingHandler()?.(e)}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <Show when={header.column.getIsSorted()}>
                                <span class="ml-2 flex items-center justify-center rounded bg-gray-100 px-1 text-gray-900 group-hover:bg-gray-200">
                                  {header.column.getIsSorted() === "desc" && <ChevronDown size={16} />}
                                  {header.column.getIsSorted() === "asc" && <ChevronUp size={16} />}
                                </span>
                              </Show>
                              {/* Show chevron on hover */}
                              <Show when={header.column.getCanSort() && !header.column.getIsSorted()}>
                                <span class="ml-3 flex items-center justify-center text-gray-900 opacity-0 transition group-hover:opacity-100">
                                  <ChevronUp size={16} />
                                </span>
                              </Show>
                            </div>
                          )}
                        </th>
                      );
                    }}
                  </For>
                </tr>
              )}
            </For>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <Show
              when={dataTable.getRowModel().rows.length > 0}
              fallback={
                <tr>
                  <td colSpan={dataTable.getHeaderGroups()[0]?.headers.length ?? 1} class="px-4 py-4">
                    {i18n.t("common.noData")}
                  </td>
                </tr>
              }
            >
              <For each={dataTable.getRowModel().rows}>
                {(row) => (
                  <tr>
                    <For each={row.getVisibleCells()}>
                      {(cell) => (
                        <td class="py-5 pr-3 pl-3 text-sm whitespace-nowrap text-gray-500 first:pl-4 first:whitespace-pre-line last:pl-4 first:sm:pl-5 last:sm:pr-5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </Show>
          </tbody>
        </table>
      </div>
      <Show when={mergedProps.enablePagination}>
        <div class="mt-4 grid grid-cols-1 items-center gap-x-4 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
          <div class="order-3 flex items-center gap-2 justify-self-center md:order-1 md:justify-self-start">
            <label for={`${mergedProps.id}-page-size-select`} class="mr-2 text-sm font-medium text-gray-700">
              {i18n.t("dataTable.pageSize")}
            </label>
            <select
              id={`${mergedProps.id}-page-size-select`}
              class="block w-auto rounded-md border border-gray-300 bg-white p-1.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
              aria-label={i18n.t("dataTable.pageSize")}
              value={pageSize()}
              onChange={(e) => setPagination((prev) => ({ ...prev, pageIndex: 0, pageSize: parseInt(e.target.value) }))}
            >
              <For each={mergedProps.pageSizeOptions}>
                {(sizeOption) => <option value={sizeOption}>{sizeOption}</option>}
              </For>
            </select>
          </div>
          <div class="order-3 justify-self-center md:order-2">
            <TableDataInfo endIndex={endIndex} startIndex={startIndex} totalRowsCount={totalRowsCount} />
          </div>
          <div class="order-1 justify-self-center md:order-3 md:justify-self-end">
            <Pagination
              currentPage={pagination().pageIndex}
              totalPages={totalPagesCount()}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, pageIndex: page }))}
            />
          </div>
        </div>
      </Show>
    </div>
  );
};
