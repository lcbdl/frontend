import { useApi } from "@/context/api-context";
import i18n from "@/i18n";
import { MemberDetail } from "@/types/MemberDetail";
import { debounce } from "@solid-primitives/scheduled";
import { useQuery } from "@tanstack/solid-query";
import { Component, createMemo, createSignal, For, Show } from "solid-js";
import Loading from "./ui/loading";

export const MemberDirectory: Component = () => {
  const api = useApi();
  const queryFn = () =>
    api
      .get<MemberDetail[]>("/members")
      .then((res) => res.data.map((item) => ({ ...item, initial: item.lastName.toUpperCase().charAt(0) })));
  const query = useQuery(() => ({
    queryKey: ["memberDirectory"],
    queryFn,
  }));

  const [search, setSearch] = createSignal<string>("");

  const sortedList = createMemo(() => {
    const sorted = [...(query.data ?? [])].sort((a, b) => {
      if (a.initial > b.initial) return 1;
      else if (a.initial < b.initial) return -1;
      else return 0;
    });
    return sorted.filter((item) => item.contactName.toLowerCase().includes(search().toLowerCase()));
  });
  const alphabets = createMemo(() => Array.from(new Set(sortedList().map((l) => l.initial))));

  const handleSearch = (e: InputEvent) => {
    setSearch((e.target as HTMLInputElement).value);
  };

  return (
    <section class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
      <div class="bg-gray-50 px-4 py-5 sm:px-6">
        <label for="memberDirectorySearch">
          <span class="block text-lg leading-6 font-medium text-gray-900">{i18n.t("memberDirectory.title")}</span>
          <span class="block text-sm">{i18n.t("memberDirectory.subtitle")}</span>
        </label>
        <input
          id="memberDirectorySearch"
          class="border-black-500 mt-2 mb-3 w-full rounded-md border border-[#8B8D91] px-3 py-2 leading-tight text-gray-700 shadow-[0_1px_2px_0_rgb(0,0,0,0.3)] focus:border-white focus:ring-2 focus:ring-[#1CA33E] focus:outline-none"
          type="text"
          onInput={debounce(handleSearch, 500)}
        />
        <div id="member-result-info" class="text-sm" role="status" aria-live="polite">
          {i18n.t("memberDirectory.resultCount", {
            filteredCount: sortedList().length,
            total: query.data?.length || 0,
          })}
        </div>
      </div>
      <div id="memberDirectory" class="h-80 w-full overflow-y-auto" aria-label="Directory">
        <Show when={query.isLoading}>
          <Loading />
        </Show>
        <Show when={query.isError}>
          <span>{query.error?.message}</span>
        </Show>
        <Show when={!query.isError && !query.isLoading}>
          <For each={alphabets()}>
            {(letter) => (
              <div class="relative" id={`${letter}-members`}>
                <div class="sticky top-0 z-0 border-y border-t-gray-100 border-b-gray-200 bg-gray-50 px-6 py-1.5 text-sm leading-6 font-semibold text-gray-900">
                  <span class="sr-only">{i18n.t("memberDirectory.description", { directory: letter })}</span>
                  <span>{letter}</span>
                </div>
                <div class="divide-y divide-gray-100">
                  <For each={sortedList().filter((item) => item.initial === letter)}>
                    {(item) => (
                      <div class="member-li flex justify-between gap-x-4 px-6 py-5">
                        <div class="min-w-0">
                          <p class="text-sm leading-tight font-semibold text-gray-900">
                            {item.contactName}
                            <span class="ml-.5 rounded-md bg-gray-100 px-2 py-1 text-xs">{item.requestorProvName}</span>
                          </p>
                          <div class="flex flex-col">
                            <a
                              href="tel:123-123-1234"
                              aria-label="phone number 123-123-1234"
                              class="mt-1.5 flex flex-row truncate text-sm text-gray-600"
                            >
                              <svg
                                aria-hidden="true"
                                class="my-auto mr-2 h-3 w-3"
                                fill="currentColor"
                                viewBox="0 0 512 512"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  clip-rule="evenodd"
                                  d="M487.8 24.1L387 .8c-14.7-3.4-29.8 4.2-35.8 18.1l-46.5 108.5c-5.5 12.7-1.8 27.7 8.9 36.5l53.9 44.1c-34 69.2-90.3 125.6-159.6 159.6l-44.1-53.9c-8.8-10.7-23.8-14.4-36.5-8.9L18.9 351.3C5 357.3-2.6 372.3.8 387L24 487.7C27.3 502 39.9 512 54.5 512 306.7 512 512 307.8 512 54.5c0-14.6-10-27.2-24.2-30.4zM55.1 480l-23-99.6 107.4-46 59.5 72.8c103.6-48.6 159.7-104.9 208.1-208.1l-72.8-59.5 46-107.4 99.6 23C479.7 289.7 289.6 479.7 55.1 480z"
                                  fill-rule="evenodd"
                                />
                              </svg>
                              <span>{item.contactPhoneNumber || "N/A"}</span>
                            </a>
                            <a
                              href={`mailto:${item.contactEmail}`}
                              aria-label={`email ${item.contactEmail}`}
                              class="mt-1 flex flex-row truncate text-sm text-cyan-800 hover:underline hover:underline-offset-2"
                            >
                              <svg
                                aria-hidden="true"
                                class="my-auto mr-2 h-3 w-3 text-gray-600"
                                fill="currentColor"
                                viewBox="0 0 532 512"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  clip-rule="evenodd"
                                  d="M464 64H48C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM48 96h416c8.8 0 16 7.2 16 16v41.4c-21.9 18.5-53.2 44-150.6 121.3-16.9 13.4-50.2 45.7-73.4 45.3-23.2.4-56.6-31.9-73.4-45.3C85.2 197.4 53.9 171.9 32 153.4V112c0-8.8 7.2-16 16-16zm416 320H48c-8.8 0-16-7.2-16-16V195c22.8 18.7 58.8 47.6 130.7 104.7 20.5 16.4 56.7 52.5 93.3 52.3 36.4.3 72.3-35.5 93.3-52.3 71.9-57.1 107.9-86 130.7-104.7v205c0 8.8-7.2 16-16 16z"
                                  fill-rule="evenodd"
                                />
                              </svg>
                              <span class="text-wrap">{item.contactEmail}</span>
                            </a>
                          </div>
                        </div>
                        <div>
                          <img
                            class="w-10 flex-none bg-gray-50"
                            src={`img/flag-${item.requestorId}.svg`}
                            alt={item.requestorProvName}
                          />
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </section>
  );
};
