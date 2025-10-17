import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-fields/text-field";
import i18n from "@/i18n";
import { SubmitHandler, createForm, reset } from "@modular-forms/solid";
import dayjs from "dayjs";
import { omit } from "lodash";
import { Show, type Component } from "solid-js";
import { DateField } from "./ui/form-fields/date-field";
import { TextArea } from "./ui/form-fields/text-area-field";
import { TimeField } from "./ui/form-fields/time-field";

type EventFormData = {
  title: string;
  eventLocation: string;
  eventOrganizer: string;
  eventStartDate: string;
  eventStartTime: string;
  eventEndDate: string;
  eventEndTime: string;
  eventTopic: string;
  eventStatus: number;
};

type EventFormLabels = {
  title: string;
  location: string;
  organizer: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  submitButton: string;
  cancelButton: string;
  formTitle: string;
  formInstructions: string;
  errors: {
    title: string;
    location: string;
    organizer: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    description: string;
    formLevel: string;
  };
};

type AddEventFormProps = {
  onSubmit: (data: FormData) => Promise<void>;
  close: () => void;
  labels: EventFormLabels;
};

const AddEventForm: Component<AddEventFormProps> = ({ onSubmit, close, labels }) => {
  const [form, { Form, Field }] = createForm<EventFormData>({
    initialValues: {
      title: "",
      eventLocation: "",
      eventOrganizer: "",
      eventStartDate: undefined,
      eventStartTime: "00:00",
      eventEndDate: undefined,
      eventEndTime: "00:00",
      eventTopic: "",
      eventStatus: 1,
    },
    validate: (values) => {
      const errors: Partial<Record<keyof EventFormData | "formLevel", string>> = {};

      if (!values.title) errors.title = labels.errors.title;
      if (!values.eventLocation) errors.eventLocation = labels.errors.location;
      if (!values.eventOrganizer) errors.eventOrganizer = labels.errors.organizer;
      if (!values.eventStartDate) errors.eventStartDate = labels.errors.startDate;
      if (!values.eventStartTime) errors.eventStartTime = labels.errors.startTime;
      if (!values.eventEndDate) errors.eventEndDate = labels.errors.endDate;
      if (!values.eventEndTime) errors.eventEndTime = labels.errors.endTime;
      if (!values.eventTopic) errors.eventTopic = labels.errors.description;

      if (values.eventStartDate && values.eventEndDate) {
        const start = new Date(values.eventStartDate);
        const end = new Date(values.eventEndDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
          errors.eventStartDate = i18n.t("sharedCalendar.addCalendarEventForm.errors.startDateBefore");
          errors.eventEndDate = i18n.t("sharedCalendar.addCalendarEventForm.errors.endDateAfter");
        }
      }

      if (Object.keys(errors).length > 0) {
        errors.formLevel = labels.errors.formLevel;
      }

      return errors;
    },
  });

  const handleSubmit: SubmitHandler<EventFormData> = async (values) => {
    try {
      console.log("Submitting event:", values);

      const formatDate = (dateStr: string) => dayjs(dateStr).format("MM/DD/YYYY");

      const formData = new FormData();
      formData.append("eventTitleEng", values.title ?? "");
      formData.append("eventTitleFrc", values.title ?? "");
      formData.append("eventLocation", values.eventLocation ?? "");
      formData.append("eventOrganizer", values.eventOrganizer ?? "");
      formData.append("eventStartDate", formatDate(values.eventStartDate) ?? "");
      formData.append("eventStartTime", values.eventStartTime ?? "");
      formData.append("eventEndDate", formatDate(values.eventEndDate) ?? "");
      formData.append("eventEndTime", values.eventEndTime ?? "");
      formData.append("eventTopic", values.eventTopic ?? "");
      formData.append("eventStatus", "1");

      await onSubmit(formData);
      reset(form);
      close();
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      class="mx-auto w-full max-w-lg space-y-2"
      aria-labelledby="formTitle"
      aria-describedby={form.invalid ? "form-error" : undefined}
    >
      <div class="flex items-center space-x-4">
        <svg
          class="h-12 w-12 flex-shrink-0 text-gray-900 opacity-70"
          fill="currentColor"
          viewBox="0 0 448 512"
          aria-hidden="true"
        >
          <path d="M112 0c8.8 0 16 7.2 16 16V64H320V16c0-8.8 7.2-16 16-16s16 7.2 16 16V64h32c35.3 0 64 28.7 64 64v32 32V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V192 160 128C0 92.7 28.7 64 64 64H96V16c0-8.8 7.2-16 16-16zM416 192H32V448c0 17.7 14.3 32 32 32H384c17.7 0 32-14.3 32-32V192zM384 96H64c-17.7 0-32 14.3-32 32v32H416V128c0-17.7-14.3-32-32-32zM320 336c0 8.8-7.2 16-16 16H240v64c0 8.8-7.2 16-16 16s-16-7.2-16-16V352H144c-8.8 0-16-7.2-16-16s7.2-16 16-16h64V256c0-8.8 7.2-16 16-16s16 7.2 16 16v64h64c8.8 0 16 7.2 16 16z"></path>
        </svg>

        <div>
          <h2 id="formTitle" class="text-xl font-semibold text-gray-900">
            {labels.formTitle}
          </h2>
          <p class="text-sm text-gray-600">{labels.formInstructions}</p>
        </div>
      </div>

      <Show when={form.invalid}>
        <div id="form-error" class="mb-2 font-semibold text-red-600" role="alert" aria-live="assertive">
          {labels.errors.formLevel}
        </div>
      </Show>

      {/* English + French Titles */}
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="title" type="string">
          {(field, props) => (
            <TextField {...props} type="text" label={labels.title} value={field.value} error={field.error} required />
          )}
        </Field>

        {/* Location */}
        <Field name="eventLocation" type="string">
          {(field, props) => (
            <TextField
              {...props}
              type="text"
              label={labels.location}
              value={field.value}
              error={field.error}
              required
            />
          )}
        </Field>
      </div>

      {/* Organizer */}
      <div class="mb-4">
        <Field name="eventOrganizer" type="string">
          {(field, props) => (
            <TextField
              {...props}
              type="text"
              label={labels.organizer}
              value={field.value}
              error={field.error}
              required
            />
          )}
        </Field>
      </div>

      {/* Start Date + Time */}
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="eventStartDate" type="string">
          {(field, props) => (
            <DateField
              {...omit(props, "onChange")}
              required
              data-testid={labels.startDate}
              label={labels.startDate}
              value={field.value}
              error={field.error}
              onInput={(e) => {
                props.onInput(e);
              }}
            />
          )}
        </Field>

        <Field name="eventStartTime" type="string">
          {(field, props) => (
            <TimeField
              {...field}
              required
              label={labels.startTime}
              error={field.error}
              value={field.value}
              onInput={(e) => props.onInput(e)}
            />
          )}
        </Field>
      </div>

      {/* End Date + Time */}
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="eventEndDate" type="string">
          {(field, props) => (
            <DateField
              {...omit(props, "onChange")}
              required
              label={labels.endDate}
              value={field.value}
              error={field.error}
              onInput={(e) => {
                props.onInput(e);
              }}
            />
          )}
        </Field>

        <Field name="eventEndTime" type="string">
          {(field, props) => (
            <TimeField
              {...field}
              required
              label={labels.endTime}
              error={field.error}
              value={field.value}
              onInput={(e) => props.onInput(e)}
            />
          )}
        </Field>
      </div>

      {/* Description */}
      <Field name="eventTopic" type="string">
        {(field, props) => (
          <TextArea {...props} label={labels.description} value={field.value} error={field.error} required />
        )}
      </Field>

      {/* Buttons */}
      <div class="flex justify-end gap-3 pt-4">
        <Button type="submit" variant="secondary">
          {labels.submitButton}
        </Button>
        <Button type="button" variant="outlined" onclick={close}>
          {labels.cancelButton}
        </Button>
      </div>
    </Form>
  );
};

export default AddEventForm;
