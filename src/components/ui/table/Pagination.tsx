import i18n from "@/i18n";
import { Component, For, Show, createMemo } from "solid-js";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: Component<PaginationProps> = (props) => {
  const isFirstPage = () => props.currentPage === 0;
  const isLastPage = () => props.currentPage === props.totalPages - 1;

  const pagesToShow = createMemo(() => {
    const total = props.totalPages;
    const current = props.currentPage;
    const range: (number | "...")[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        range.push(i);
      }
    } else {
      const left = Math.max(0, current - 1);
      const right = Math.min(total - 1, current + 1);

      if (left > 1) {
        range.push(0, "...");
      } else {
        for (let i = 0; i < left; i++) range.push(i);
      }

      for (let i = left; i <= right; i++) range.push(i);

      if (right < total - 2) {
        range.push("...", total - 1);
      } else {
        for (let i = right + 1; i < total; i++) range.push(i);
      }
    }

    return range;
  });

  const handlePageClick = (page: number | "...") => {
    if (typeof page === "number" && page !== props.currentPage) {
      props.onPageChange(page);
    }
  };

  return (
    <nav class="flex -space-x-px text-sm select-none">
      {/* Previous Button */}
      <button
        disabled={isFirstPage()}
        onClick={() => props.onPageChange(props.currentPage - 1)}
        class="items-center rounded-l-md px-2 py-1.5 text-gray-500 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-offset-0 disabled:opacity-50"
      >
        <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
          <path
            fill-rule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="sr-only">{i18n.t("dataTable.prevPage")}</span>
      </button>

      {/* Page numbers (hidden on small screefocus:ring-offset-0ns) */}
      <ul class="flex">
        <For each={pagesToShow()}>
          {(page) => (
            <li>
              <Show
                when={page !== "..."}
                fallback={
                  <span class="block h-full border border-gray-300 px-3 py-1 text-gray-500 select-none">...</span>
                }
              >
                <button
                  onClick={() => handlePageClick(page)}
                  class={`h-full border px-3 ${
                    page === props.currentPage
                      ? "border-gray-800 bg-gray-800 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span aria-hidden="true">{(page as number) + 1}</span>
                  <span class="sr-only">{i18n.t("dataTable.gotoPage", { page: (page as number) + 1 })}</span>
                </button>
              </Show>
            </li>
          )}
        </For>
      </ul>

      {/* Next Button */}
      <button
        class="items-center rounded-r-md px-2 py-1.5 text-gray-500 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-offset-0 disabled:opacity-50"
        disabled={isLastPage()}
        onClick={() => props.onPageChange(props.currentPage + 1)}
      >
        <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
          <path
            fill-rule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="sr-only">{i18n.t("dataTable.nextPage")}</span>
      </button>
    </nav>
  );
};
