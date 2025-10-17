import { Pagination } from "@/components/ui/table/Pagination";
import { createSignal } from "solid-js";

export const PaginationDemo = () => {
  const [currentPage, setCurrentPage] = createSignal(0);
  const [totalPages, setTotalPages] = createSignal(20);

  return (
    <div>
      <h2>Button - Variants</h2>
      <div class="my-3 flex flex-col gap-4 rounded-lg border-1 border-solid border-gray-500 p-5 shadow-lg shadow-gray-500/25">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <label for="currentPage">Current Page</label>{" "}
            <input
              type="number"
              id="currentPage"
              value={currentPage() + 1}
              min={1}
              max={totalPages()}
              class="appearance-none rounded border border-gray-300 px-2 py-1.5 text-sm leading-tight text-gray-700 shadow focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 focus:ring-offset-white focus:outline-none disabled:pointer-events-none disabled:opacity-70"
              onInput={(e) => setCurrentPage(parseInt(e.target.value) - 1)}
            />
          </div>
          <div class="flex items-center gap-2">
            <label for="totalPages">Total Pages</label>{" "}
            <input
              type="number"
              id="totalPages"
              min={1}
              value={totalPages()}
              class="appearance-none rounded border border-gray-300 px-2 py-1.5 text-sm leading-tight text-gray-700 shadow focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 focus:ring-offset-white focus:outline-none disabled:pointer-events-none disabled:opacity-70"
              onInput={(e) => setTotalPages(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div>
          <Pagination
            currentPage={currentPage()}
            totalPages={totalPages()}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};
