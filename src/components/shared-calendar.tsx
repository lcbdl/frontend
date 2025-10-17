import { useApi } from "@/context/api-context.tsx";
import i18n from "@/i18n/index.ts";
import { NpCalendarEvent } from "@/types/CalendarEvent.ts";
import { formatTime } from "@/utils/common-utils.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { Trash2 } from "lucide-solid";
import { Match, Switch, createMemo, createSignal } from "solid-js";
import AddEventForm from "./add-new-event.tsx";
import { Button } from "./ui/button.tsx";
import { Calendar, CalendarEvent } from "./ui/calendar.tsx";
import Loading from "./ui/loading.tsx";
import { Modal } from "./ui/modal-dialog.tsx";
import { UpcomingEvents } from "./upcoming-events.tsx";

const isTestEnv = import.meta.env?.MODE === "test"; // Vite-specific

export const SharedCalendar = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const today = dayjs();
  const [showConfirmation, setShowConfirmation] = createSignal(false);
  const [eventIdToDelete, setEventIdToDelete] = createSignal<number | undefined>();
  const [isAddOpen, setIsAddOpen] = createSignal(false);

  const queryFn: () => Promise<CalendarEvent[]> = async () => {
    const res = await api.get<NpCalendarEvent[]>("/responseHub/calendarEvents/status/1");
    return res.data.map((event) => ({
      eventId: event.eventId,
      title: event.locale === "fr" ? event.eventTitleFrc : event.eventTitleEng,
      location: event.eventLocation,
      organizer: event.eventOrganizer,
      description: event.eventDescription,
      start: event.startTime,
      end: event.endTime,
      lang: event.locale,
      requestor: {
        requestorId: event.requestorId,
        firstName: event.firstName,
        lastName: event.lastName,
      },
    }));
  };

  const query = useQuery(() => ({
    queryKey: ["calendarEvents"],
    queryFn,
    retry: isTestEnv ? false : 3,
  }));

  const deleteMutation = useMutation(() => ({
    mutationFn: (id: number) => api.delete(`/responseHub/calendarEvents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      closeDialog();
    },
  }));

  const addMutation = useMutation(() => ({
    mutationFn: async (newEvent: FormData) => {
      const response = await api.post("/responseHub/calendarEvents", newEvent);
      console.log("response : ", response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      setIsAddOpen(false);
    },
  }));

  const upcomingEvents = createMemo<CalendarEvent[]>(() =>
    (query.data ?? []).filter((event) => {
      const endDate = event.end ? dayjs(event.end.replace(/[+-]\d{4}$/, "")) : null;
      if (endDate?.isSame(today, "day") || endDate?.isAfter(today, "day")) {
        return true;
      } else {
        return false;
      }
    }),
  );

  const calendarEventToDelete = createMemo(() => {
    const selectedEvent = upcomingEvents().find((event) => event.eventId === eventIdToDelete());
    if (selectedEvent) {
      let text = `${i18n.t("sharedCalendar.fields.duration")}: ${formatTime(selectedEvent.start)} - ${formatTime(selectedEvent.end)}\n`;
      text += `${i18n.t("sharedCalendar.fields.eventTitle")}: ${selectedEvent.title}\n`;
      text += `${i18n.t("sharedCalendar.fields.description")}: ${selectedEvent.description}\n`;
      text += `${i18n.t("sharedCalendar.fields.eventOwner")}: ${selectedEvent.requestor.firstName} ${selectedEvent.requestor.lastName}\n`;
      return text;
    } else {
      return "";
    }
  });

  const showDeleteConfirmation = (id: number) => {
    setEventIdToDelete(id);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (eventIdToDelete()) {
      deleteMutation.mutate(eventIdToDelete()!);
    }
  };

  const closeDialog = () => {
    setShowConfirmation(false);
    setEventIdToDelete(undefined);
  };

  return (
    <section
      aria-labelledby="quick_links_heading_shared_calendar"
      class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow"
    >
      <div class="flex justify-between bg-gray-50 px-4 py-5 sm:px-6">
        <h2 id="quick_links_heading_shared_calendar" class="text-lg leading-6 font-medium text-gray-900">
          {i18n.t("sharedCalendar.title")}
        </h2>

        <button
          id="calendarEventAdd"
          onClick={() => setIsAddOpen(true)}
          class="py-.5 inline-flex flex-shrink-0 cursor-pointer items-center rounded-full border border-gray-400 px-3 text-sm font-semibold text-gray-700 shadow-sm transition ease-in-out hover:border-transparent hover:bg-slate-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="mr-2 -ml-1 h-3 w-3"
            fill="currentColor"
            viewBox="0 0 448 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"
              fill-rule="evenodd"
            />
          </svg>
          <span>{i18n.t("sharedCalendar.add")}</span>
        </button>

        <Modal showCloseButton={true} open={isAddOpen()} onClose={() => setIsAddOpen(false)} containerClass="flex-col">
          <>
            <AddEventForm
              onSubmit={async (data) => {
                await addMutation.mutate(data);
                queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
              }}
              close={() => setIsAddOpen(false)}
              labels={{
                title: i18n.t("sharedCalendar.addCalendarEventForm.title"),
                location: i18n.t("sharedCalendar.addCalendarEventForm.location"),
                organizer: i18n.t("sharedCalendar.addCalendarEventForm.organizer"),
                startDate: i18n.t("sharedCalendar.addCalendarEventForm.startDate"),
                startTime: i18n.t("sharedCalendar.addCalendarEventForm.startTime"),
                endDate: i18n.t("sharedCalendar.addCalendarEventForm.endDate"),
                endTime: i18n.t("sharedCalendar.addCalendarEventForm.endTime"),
                description: i18n.t("sharedCalendar.addCalendarEventForm.description"),
                submitButton: i18n.t("sharedCalendar.addCalendarEventForm.submitButton"),
                cancelButton: i18n.t("common.cancel"),
                formTitle: i18n.t("sharedCalendar.addCalendarEventForm.formTitle"),
                formInstructions: i18n.t("sharedCalendar.addCalendarEventForm.formInstructions"),
                errors: {
                  title: i18n.t("sharedCalendar.addCalendarEventForm.errors.title"),
                  location: i18n.t("sharedCalendar.addCalendarEventForm.errors.location"),
                  organizer: i18n.t("sharedCalendar.addCalendarEventForm.errors.organizer"),
                  startDate: i18n.t("sharedCalendar.addCalendarEventForm.errors.startDate"),
                  startTime: i18n.t("sharedCalendar.addCalendarEventForm.errors.startTime"),
                  endDate: i18n.t("sharedCalendar.addCalendarEventForm.errors.endDate"),
                  endTime: i18n.t("sharedCalendar.addCalendarEventForm.errors.endTime"),
                  description: i18n.t("sharedCalendar.addCalendarEventForm.errors.description"),
                  formLevel: i18n.t("sharedCalendar.addCalendarEventForm.errors.formLevel"),
                },
              }}
            />
          </>
        </Modal>
      </div>
      <div class="bg-white px-4 py-5 sm:p-6">
        <div class="flow-root">
          <div class="pb-4">
            <p class="text-sm">{i18n.t("sharedCalendar.instruction")}</p>
          </div>
          <Switch>
            <Match when={query.isPending}>
              <Loading />
            </Match>
            <Match when={query.isError}>
              <span>{query.error?.message}</span>
            </Match>
            <Match when={query.isSuccess}>
              <Calendar events={query.data ?? []} />
              <UpcomingEvents events={upcomingEvents()} onDelete={showDeleteConfirmation} />
            </Match>
          </Switch>
          <Modal
            containerClass="justify-center"
            open={showConfirmation()}
            onClose={() => closeDialog()}
            title={
              <span>
                <Trash2 class="inline h-6 w-5" />
                {i18n.t("sharedCalendar.delete")}
              </span>
            }
            actions={
              <>
                <Button onClick={handleConfirmDelete} variant={"danger"}>
                  {i18n.t("common.ok")}
                </Button>
                <Button onClick={closeDialog} variant={"outlined"}>
                  {i18n.t("common.cancel")}
                </Button>
              </>
            }
          >
            <p class="pb-3">{i18n.t("sharedCalendar.deleteConfirmation")}</p>
            <label for="selectedEvent" class="mb-1.5 block text-sm font-medium text-nowrap text-gray-700">
              {i18n.t("sharedCalendar.selectedEvent")}
            </label>
            <textarea
              id="selectedEvent"
              class="h-[120px] w-full appearance-none rounded border border-gray-300 px-3 py-2 leading-tight text-gray-700 shadow"
              value={calendarEventToDelete()}
            />
          </Modal>
        </div>
      </div>
    </section>
  );
};
