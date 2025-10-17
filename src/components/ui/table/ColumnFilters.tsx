import i18n from "@/i18n";
import { Column, ColumnFiltersState } from "@tanstack/solid-table";
import {
  Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  Setter,
  Show,
  Switch,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Accordion, AccordionItem } from "../Accordion";
import { Button } from "../button";
import { AutoSuggestFilter } from "./AutoSuggestFilter";
import { MultipleSelectionFilter, MultipleSelectionFilterOptionType } from "./MultipleSelectionFilter";
import { NumberRangeFilter, RangeOption } from "./NumberRangeFilter";

type ColumnFiltersProps<TData> = {
  columnFilters: Accessor<ColumnFiltersState>;
  setColumnFilters: Setter<ColumnFiltersState>;
  columns: Column<TData, unknown>[];
  showCloseButton?: boolean;
};

export const ColumnFilters = <TData,>(props: ColumnFiltersProps<TData>) => {
  const [open, setOpen] = createSignal(false);
  const [internalColumnFilters, setInternalColumnFilters] = createSignal(props.columnFilters());
  const [positionStyles, setPositionStyles] = createSignal<{ top: string; left: string } | null>(null);
  const columnOrder = createMemo(() => new Map(props.columns.map((col, index) => [col.id, index])));

  let filterButtonRef: HTMLButtonElement | undefined;
  let panelRef: HTMLDivElement | undefined;

  createEffect(() => {
    setInternalColumnFilters(props.columnFilters());
  });

  createEffect(() => {
    document.addEventListener("keydown", trapFocus);
    onCleanup(() => {
      document.removeEventListener("keydown", trapFocus);
    });
  });

  createEffect(() => {
    if (open() && filterButtonRef && panelRef) {
      queueMicrotask(() => {
        const buttonRect = filterButtonRef!.getBoundingClientRect();
        const panelRect = panelRef!.getBoundingClientRect();

        const top = buttonRect.bottom + window.scrollY;
        const left = buttonRect.right - panelRect.width + window.scrollX;

        setPositionStyles({
          top: `${top}px`,
          left: `${left}px`,
        });

        const firstFocusable = panelRef.querySelector<HTMLElement>('input, button, [tabindex]:not([tabindex="-1"])');
        firstFocusable?.focus();
      });
    }
  });

  createEffect(() => {
    if (open()) {
      const handleClickOutside = (event: MouseEvent) => {
        if (panelRef && !panelRef.contains(event.target as Node)) {
          handleCancel();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      onCleanup(() => {
        document.removeEventListener("mousedown", handleClickOutside);
      });
    }
  });

  const updateFilter = (columnId: string, value: any) => {
    if (
      !value ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "string" && value.trim().length === 0)
    ) {
      setInternalColumnFilters((prev) => prev.filter((f) => f.id !== columnId));
    } else {
      const newFilter = { id: columnId, value };
      setInternalColumnFilters((prev) => [...prev.filter((f) => f.id !== columnId), newFilter] as ColumnFiltersState);
    }
  };

  const handleCancel = () => {
    setInternalColumnFilters(props.columnFilters());
    setOpen(false);
  };

  const handleClearAll = () => {
    setInternalColumnFilters([]);
  };

  const filterValueCounts = createMemo(() => {
    const counts = new Map<string, number>();

    props.columns.forEach((column) => {
      // @ts-expect-error custom filter function
      if (column.columnDef.filterFn === "customNumberRangeFn") {
        counts.set(
          column.id,
          (internalColumnFilters().find((item) => item.id === column.id)?.value as RangeOption[])?.length ?? 0,
        );
      } else if (
        // @ts-expect-error custom filter function
        column.columnDef.filterFn === "customMultipleSelectionFn" ||
        // @ts-expect-error custom filter function
        column.columnDef.filterFn === "customAutoSuggestionFn"
      ) {
        counts.set(
          column.id,
          (internalColumnFilters().find((item) => item.id === column.id)?.value as any[])?.length ?? 0,
        );
      } else {
        counts.set(
          column.id,
          internalColumnFilters().find((item) => item.id === column.id)?.value === undefined ? 0 : 1,
        );
      }
    });

    return counts;
  });

  const getFilterValueCount = (column: Column<TData>) => {
    return filterValueCounts().get(column.id) ?? 0;
  };

  const trapFocus = (e: KeyboardEvent) => {
    if (!open() || !panelRef) return;

    const focusableEls = panelRef.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      filterButtonRef?.focus();
    }
  };

  const handleApplyFilters = () => {
    const columnFilters = internalColumnFilters();
    const colOrder = columnOrder();
    // Sort columnFilters based on the order of columns
    columnFilters.sort((a, b) => (colOrder.get(a.id) ?? Infinity) - (colOrder.get(b.id) ?? Infinity));
    props.setColumnFilters(columnFilters);
    setOpen(false);
  };

  return (
    <div class="relative flex sm:justify-end">
      <Button
        ref={filterButtonRef}
        variant="default"
        size={"md"}
        class="flex w-full items-center md:w-auto"
        onClick={() => setOpen(!open())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open());
          }
        }}
        aria-expanded={open()}
        aria-haspopup="dialog"
        aria-controls="filter-panel"
        aria-describedby="filter-count-description"
      >
        <svg
          aria-hidden="true"
          class="mr-2 h-4 w-4"
          fill="currentColor"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M40 64C24.2 64 9.9 73.3 3.5 87.7s-3.8 31.3 6.8 43L112 243.8 112 368c0 10.1 4.7 19.6 12.8 25.6l64 48c9.7 7.3 22.7 8.4 33.5 3s17.7-16.5 17.7-28.6l0-172.2 101.7-113c10.6-11.7 13.2-28.6 6.8-43S327.8 64 312 64L40 64zM352 384c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-128 0zM320 256c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-128 0c-17.7 0-32 14.3-32 32zM416 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0z"
            fill-rule="evenodd"
          />
        </svg>
        {i18n.t("dataTable.filters")}
        <div class="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[0.7rem] text-gray-800">
          <span class="sr-only">{i18n.t("dataTable.filtersCount", { count: props.columnFilters().length })}</span>
          {props.columnFilters().length}
        </div>
      </Button>
      <Show when={open()}>
        <Portal>
          <div
            ref={panelRef}
            class="z-40 mt-2 w-sm divide-y divide-sky-700/20 rounded-md border border-sky-800 bg-white md:w-80"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-panel-title"
            aria-describedby="filter-panel-description"
            style={{
              position: "absolute",
              top: positionStyles()?.top ?? "0px",
              left: positionStyles()?.left ?? "0px",
            }}
          >
            <div class="relative my-auto flex flex-row items-center justify-between gap-2 rounded-t-md bg-sky-700 p-2 font-semibold text-white">
              <div class="my-auto flex flex-row items-center font-semibold text-white">
                <svg
                  aria-hidden="true"
                  class="mx-1.5 h-4 w-4 flex-shrink-0 text-white"
                  fill="currentColor"
                  data-icon="question-circle"
                  data-prefix="far"
                  role="img"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clip-rule="evenodd"
                    d="M41.2 64C18.5 64 0 82.5 0 105.2c0 10.4 3.9 20.4 11 28.1l93 100.1 0 126c0 13.4 6.7 26 18 33.4l75.5 49.8c5.3 3.5 11.6 5.4 18 5.4c18 0 32.6-14.6 32.6-32.6l0-182 93-100.1c7.1-7.6 11-17.6 11-28.1C352 82.5 333.5 64 310.8 64L41.2 64zM145.6 207.7L56.8 112l238.5 0-88.8 95.7c-4.1 4.4-6.4 10.3-6.4 16.3l0 162.8-48-31.7L152 224c0-6.1-2.3-11.9-6.4-16.3zM344 392c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0zM320 256c0 13.3 10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0c-13.3 0-24 10.7-24 24zM408 72c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0z"
                    fill-rule="evenodd"
                  />
                </svg>
                <span id="filter-panel-title">{i18n.t("dataTable.filterSelection")}</span>
              </div>
              <div id="filter-panel-description" class="sr-only">
                {i18n.t("dataTable.filterPanelDescription")}
              </div>
              <Show when={props.showCloseButton}>
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center rounded-full text-sky-100 transition duration-100 hover:bg-gray-700 hover:text-white hover:shadow-gray-800/10 hover:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                  aria-label={i18n.t("common.close")}
                  onClick={handleCancel}
                >
                  <svg
                    aria-hidden="true"
                    class="h-6 w-6 p-1.5"
                    fill="currentColor"
                    viewBox="0 0 448  512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M41 39C31.6 29.7 16.4 29.7 7 39S-2.3 63.6 7 73l183 183L7 439c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l183-183L407 473c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-183-183L441 73c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-183 183L41 39z"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </Show>
            </div>
            <div class="max-h-[600px]">
              <Accordion isMulti={false} activeIndex={[0]}>
                <For each={props.columns}>
                  {(column) => {
                    return (
                      <AccordionItem
                        index={column.getIndex()}
                        title={column.columnDef.header as any}
                        selectedValueCount={getFilterValueCount(column)}
                        aria-describedby={`filter-${column.id}-description`}
                        maxHeight={200}
                      >
                        <div id={`filter-${column.id}-description`} class="sr-only">
                          {i18n.t("dataTable.filterDescription", {
                            columnName: column.id,
                            count: getFilterValueCount(column),
                          })}
                        </div>
                        <Switch
                          fallback={
                            // default text input
                            <input
                              aria-label={i18n.t("dataTable.searchFor", { columnId: column.columnDef.header })}
                              class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 shadow-xs transition duration-150 hover:border-gray-400"
                              value={
                                (internalColumnFilters().find((item) => item.id === column.id)?.value as string) ?? ""
                              }
                              onInput={(e) => {
                                const value = e.target.value;
                                updateFilter(column.id, value);
                              }}
                              placeholder={i18n.t("dataTable.searchFor", { columnId: column.columnDef.header })}
                            />
                          }
                        >
                          {/* @ts-expect-error customer function name */}
                          <Match when={column.columnDef.filterFn === "customNumberRangeFn"}>
                            <NumberRangeFilter
                              filterValue={
                                internalColumnFilters().find((item) => item.id === column.id)?.value as RangeOption[]
                              }
                              // @ts-expect-error customer function name
                              filterOptions={column.columnDef.meta?.filterOptions as RangeOption[]}
                              onChange={(value) => {
                                updateFilter(column.id, value);
                              }}
                            />
                          </Match>
                          {/* @ts-expect-error customer function name */}
                          <Match when={column.columnDef.filterFn === "customMultipleSelectionFn"}>
                            <MultipleSelectionFilter
                              id={column.id}
                              filterOptions={
                                // @ts-expect-error filter options in meta
                                column.columnDef.meta?.filterOptions as MultipleSelectionFilterOptionType<TValue>[]
                              }
                              filterValue={
                                internalColumnFilters().find((item) => item.id === column.id)?.value as string[]
                              }
                              onChange={(value) => {
                                updateFilter(column.id, value);
                              }}
                            />
                          </Match>
                          {/* @ts-expect-error customer function name */}
                          <Match when={column.columnDef.filterFn === "customAutoSuggestionFn"}>
                            <AutoSuggestFilter
                              filterValue={
                                internalColumnFilters().find((item) => item.id === column.id)?.value as string[]
                              }
                              onChange={(value) => {
                                updateFilter(column.id, value);
                              }}
                              // @ts-expect-error "params in meta"
                              fetchFn={column.columnDef.meta?.fetchFn as (query: string, top?: number) => string[]}
                              // @ts-expect-error "params in meta"
                              placeholder={column.columnDef.meta?.placeholder as string}
                            />
                          </Match>
                        </Switch>
                      </AccordionItem>
                    );
                  }}
                </For>
              </Accordion>
            </div>
            <div class="flex justify-end gap-2 rounded-b-md bg-sky-100/30 p-3">
              <Button
                aria-label={i18n.t("common.clearAll")}
                variant="flat"
                size={"sm"}
                onClick={() => handleClearAll()}
              >
                {i18n.t("common.clearAll")}
              </Button>
              <Button
                aria-label={i18n.t("dataTable.applyFilters")}
                variant={"defaultInverse"}
                size={"sm"}
                onClick={handleApplyFilters}
              >
                {i18n.t("dataTable.applyFilters")}
              </Button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
};
