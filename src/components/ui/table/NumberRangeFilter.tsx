import { createEffect, createSignal, For, Show } from "solid-js";

export type RangeOption = {
  id: string;
  label: string;
  min?: number;
  max?: number;
};

type NumberRangeFilterProps = {
  filterValue: RangeOption[];
  filterOptions?: RangeOption[];
  onChange: (value: RangeOption[]) => void;
};

export const NumberRangeFilter = (props: NumberRangeFilterProps) => {
  const options = props.filterOptions || [];

  const [selectedRanges, setSelectedRanges] = createSignal<RangeOption[]>(props.filterValue ?? []);

  createEffect(() => {
    setSelectedRanges((props.filterValue ?? []) as RangeOption[]);
  });

  const contains = (optionId: string) => {
    const index = selectedRanges().findIndex((item) => item.id === optionId);
    return index !== -1;
  };

  const handleOptionChange = (rangeOption: RangeOption, checked: boolean) => {
    let newOptions: RangeOption[];
    if (checked) {
      newOptions = [...selectedRanges(), rangeOption];
    } else {
      newOptions = selectedRanges().filter((item) => item.id !== rangeOption.id);
    }
    setSelectedRanges(newOptions);
    props.onChange(newOptions);
  };

  return (
    <div class="space-y-4">
      <div class="space-y-2">
        <Show when={options && options.length > 0}>
          {
            <For each={options}>
              {(option) => (
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    checked={contains(option.id)}
                    onChange={(e) => handleOptionChange(option, e.currentTarget.checked)}
                    class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 shadow-xs transition duration-150 hover:border-gray-400"
                  />
                  <label for={option.id} class="ml-2 text-sm">
                    {option.label}
                  </label>
                </div>
              )}
            </For>
          }
        </Show>
      </div>
    </div>
  );
};
