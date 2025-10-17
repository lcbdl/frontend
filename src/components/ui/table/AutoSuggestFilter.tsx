import { cn } from "@/utils/cls-util";
import { debounce } from "@solid-primitives/scheduled";
import { useQuery } from "@tanstack/solid-query";
import { ComponentProps, createEffect, createMemo, createSignal, createUniqueId, Show, splitProps } from "solid-js";
import { MultipleSelectionFilter } from "./MultipleSelectionFilter";

export type AutoSuggestFilterProps = Omit<ComponentProps<"input">, "type" | "value" | "onChange"> & {
  fetchFn: (query: string, top?: number) => Promise<string[]>;
  onChange?: (value: string[]) => void;
  filterValue?: string[];
};

export const AutoSuggestFilter = (props: AutoSuggestFilterProps) => {
  const [local, inputProps] = splitProps(props, [
    "id",
    "filterValue",
    "name",
    "disabled",
    "required",
    "class",
    "fetchFn",
    "onChange",
    "placeholder",
  ]);

  const id = local.id ?? createUniqueId();

  const [inputValue, setInputValue] = createSignal("");
  const [filterValue, setFilterValue] = createSignal<string[]>(local.filterValue ?? []);

  const query = useQuery(() => ({
    queryKey: ["autosuggest" + id, inputValue()],
    queryFn: () => local.fetchFn(inputValue(), 10),
    enabled: !!inputValue(),
  }));

  createEffect(() => {
    setFilterValue(local.filterValue ?? []);
  });

  const queryResults = createMemo(() => query.data ?? []);

  const combinedResults = createMemo<string[]>(() => {
    return [...new Set([...queryResults(), ...filterValue()])].sort();
  });

  const debouncedHandleInput = debounce((value: string) => {
    if (value) {
      setInputValue(value);
    }
  }, 200);

  const handleOnInput = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value.trim();
    debouncedHandleInput(value);
  };

  const handleChange = (value: string[]) => {
    setFilterValue(value);
    local.onChange?.(value);
  };

  return (
    <div class="relative" id={id}>
      <input
        id={id}
        type="text"
        class={cn(
          "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs disabled:pointer-events-none disabled:bg-gray-100 disabled:opacity-70",
          local.class,
        )}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={`${local.id ?? "autosuggest"}-listbox`}
        aria-expanded={queryResults().length > 0}
        aria-disabled={local.disabled}
        value={inputValue()}
        placeholder={local.placeholder}
        disabled={local.disabled}
        onInput={handleOnInput}
        autocomplete="off"
        {...inputProps}
      />

      <Show when={combinedResults().length}>
        <div class="pt-3">
          <MultipleSelectionFilter<string>
            id={"select-" + id}
            filterOptions={combinedResults().map((item) => ({
              value: item,
              label: item,
            }))}
            filterValue={filterValue()}
            onChange={handleChange}
          />
        </div>
      </Show>
    </div>
  );
};
