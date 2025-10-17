import { cn } from "@/utils/cls-util";
import { debounce } from "@solid-primitives/scheduled";
import { useQuery } from "@tanstack/solid-query";
import { ComponentProps, createEffect, createMemo, createSignal, For, onCleanup, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

export type AutoSuggestInputProps = Omit<ComponentProps<"input">, "type" | "value" | "onSelect"> & {
  fetchFn: (query: string, top?: number) => Promise<string[]>;
  onSelect: (value: string) => void;
  value?: string;
};

export const AutoSuggestInput = (props: AutoSuggestInputProps) => {
  const [local, inputProps] = splitProps(props, [
    "id",
    "value",
    "name",
    "disabled",
    "required",
    "class",
    "fetchFn",
    "onSelect",
    "placeholder",
  ]);

  const [selectedFromList, setSelectedFromList] = createSignal(!!local.value);
  const [inputValue, setInputValue] = createSignal(local.value ?? "");
  const [focusedIndex, setFocusedIndex] = createSignal(-1);
  const [showDropdown, setShowDropdown] = createSignal(false);

  let inputRef: HTMLInputElement;
  const [inputRect, setInputRect] = createSignal({ top: 0, left: 0, width: 0, height: 0 });

  const updateDropdownPosition = () => {
    if (inputRef) {
      const rect = inputRef.getBoundingClientRect();
      setInputRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  // Update internal value if controlled from outside
  createEffect(() => {
    setInputValue(local.value ?? "");
    setSelectedFromList(!!local.value);
  });

  const query = useQuery(() => ({
    queryKey: ["autosuggest", inputValue()],
    queryFn: () => local.fetchFn(inputValue(), 10),
    enabled: !!inputValue(),
  }));

  const results = createMemo(() => query.data ?? []);

  const debouncedHandleInput = debounce((value: string) => {
    if (value) {
      setSelectedFromList(false);
      setInputValue(value);
      setShowDropdown(true);
    }
  }, 300);

  const onInput = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value;
    debouncedHandleInput(value);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const items = results();
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = items[focusedIndex()];
      if (selected) handleSelect(selected);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSelect = (value: string) => {
    setSelectedFromList(true);
    setInputValue(value);
    local.onSelect(value);
    setShowDropdown(false);
  };

  // Close dropdown on outside click
  const onDocClick = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest(`#${local.id ?? "autosuggest"}`)) {
      setShowDropdown(false);
    }
  };

  const handleOnBlur = () => {
    setTimeout(() => {
      if (!selectedFromList()) {
        setInputValue("");
      }
      setShowDropdown(false);
    }, 100);
  };

  document.addEventListener("click", onDocClick);
  onCleanup(() => document.removeEventListener("click", onDocClick));

  return (
    <div class="relative" id={local.id ?? "autosuggest"}>
      <input
        ref={(el) => (inputRef = el)}
        id={local.id}
        type="text"
        class={cn(
          "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs disabled:pointer-events-none disabled:bg-gray-100 disabled:opacity-70",
          local.class,
        )}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={`${local.id ?? "autosuggest"}-listbox`}
        aria-expanded={showDropdown()}
        aria-disabled={local.disabled}
        value={inputValue()}
        placeholder={local.placeholder}
        disabled={local.disabled}
        onFocus={() => {
          updateDropdownPosition();
          setShowDropdown(true);
        }}
        onInput={(e) => {
          updateDropdownPosition();
          onInput(e);
        }}
        onKeyDown={onKeyDown}
        onBlur={handleOnBlur}
        autocomplete="off"
        {...inputProps}
      />

      {/* Hidden field for form submission */}
      <Show when={local.name}>
        <input type="hidden" name={local.name} value={inputValue()} />
      </Show>

      <Show when={showDropdown() && results().length}>
        <Portal>
          <ul
            id={`${local.id ?? "autosuggest"}-listbox`}
            role="listbox"
            class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow"
            style={{
              top: `${inputRect().top + inputRect().height + window.scrollY}px`,
              left: `${inputRect().left + window.scrollX}px`,
              width: `${inputRect().width}px`,
              position: "absolute",
            }}
          >
            <For each={results()}>
              {(item, i) => (
                <li
                  role="option"
                  aria-selected={i() === focusedIndex()}
                  class={cn("cursor-pointer px-3 py-2 hover:bg-blue-50", i() === focusedIndex() && "bg-blue-100")}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                >
                  {item}
                </li>
              )}
            </For>
          </ul>
        </Portal>
      </Show>
    </div>
  );
};
