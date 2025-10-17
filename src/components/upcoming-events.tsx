import i18n from "@/i18n/index.ts";
import { formatTime } from "@/utils/common-utils.ts";
import { Trash2 } from "lucide-solid";
import { Component, For, Show } from "solid-js";
import { CalendarEvent } from "./ui/calendar.tsx";

export interface UpcomingEventsProps {
  events: CalendarEvent[];
  onDelete: (id: number) => void;
}

export const UpcomingEvents: Component<UpcomingEventsProps> = (props) => {
  return (
    <div class="mt-10 -mb-4 flex flex-col justify-between align-middle">
      <p class="my-auto pb-2 text-lg font-semibold">{i18n.t("sharedCalendar.upcomingEventsTitle")}</p>
      <div class="divide-y divide-gray-100 py-3">
        <Show when={props.events.length > 0} fallback={i18n.t("sharedCalendar.noEvent")}>
          <For each={props.events}>
            {(ue) => (
              <div class="flex justify-between py-4 align-middle">
                <div>
                  <p class="mb-1 text-xs font-semibold">{`${formatTime(ue.start)} - ${formatTime(ue.end)}`}</p>
                  <p class="text-sm font-semibold">{ue.title}</p>
                  <p class="mt-1 text-xs">
                    {ue.description}
                    <span class="mx-.5 text-gray-400"> • </span>
                    {ue.organizer}
                    <span class="mx-.5 text-gray-400"> • </span>
                    {ue.location}
                  </p>
                  <p class="mt-1 text-xs">{`${ue.requestor.firstName} ${ue.requestor.lastName}`}</p>
                </div>
                <button
                  onClick={() => props.onDelete(ue.eventId)}
                  aria-label={`${i18n.t("sharedCalendar.delete")} ${ue.title}`}
                  class="my-auto flex h-6 w-5 flex-row text-gray-500 hover:text-red-700 focus:text-red-700 focus:ring-2 focus:ring-offset-1 focus:outline-none"
                >
                  <Trash2 />
                </button>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
};
