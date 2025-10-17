import { AutoSuggestInput } from "@/components/ui/AutoSuggestInput";
import { createSignal } from "solid-js";

const fakeCities = [
  "Toronto",
  "Vancouver",
  "Calgary",
  "Montreal",
  "Ottawa",
  "Edmonton",
  "Winnipeg",
  "Halifax",
  "Victoria",
  "Quebec City",
];

const fakeFetchCities = async (query: string, top = 20): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.toLowerCase();
      const results = fakeCities.filter((city) => city.toLowerCase().includes(q)).slice(0, top);
      resolve(results);
    }, 300); // simulate network delay
  });
};

export const AutoSuggestDemo = (props: { value?: string; disabled?: boolean }) => {
  const [selectedCity, setSelectedCity] = createSignal(props.value);

  return (
    <div class="mx-auto max-w-md p-6">
      <label for="cityName" class="mb-2 block font-medium text-gray-700">
        Search for city name
      </label>
      <AutoSuggestInput
        id="cityName"
        name="cityName"
        value={props.value}
        disabled={props.disabled}
        placeholder="Type a city..."
        fetchFn={fakeFetchCities}
        onSelect={(value) => setSelectedCity(value)}
      />
      <p class="mt-4 text-sm text-gray-600">
        Selected City: <strong>{selectedCity() ?? "None"}</strong>
      </p>
    </div>
  );
};
