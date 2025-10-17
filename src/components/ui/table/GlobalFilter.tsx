import i18n from "@/i18n";
import { debounce } from "@solid-primitives/scheduled";
import { Accessor, Setter } from "solid-js";
export const GlobalFilter = (props: { globalFilter: Accessor<string>; setGlobalFilter: Setter<string> }) => {
  return (
    <div class="w-full">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          aria-hidden="true"
          class="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            fill-rule="evenodd"
          />
        </svg>
      </div>
      <input
        class="w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 text-sm shadow-xs transition duration-150 hover:border-gray-400"
        type="text"
        name="search"
        value={props.globalFilter() ?? ""}
        onInput={debounce((e) => props.setGlobalFilter(e.target.value), 500)}
        aria-describedby="productShipped_info"
        placeholder={i18n.t("dataTable.searchFullTable")}
      />
    </div>
  );
};
