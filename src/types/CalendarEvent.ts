export interface NpCalendarEvent {
  eventId: number;
  eventTitleEng?: string;
  eventTitleFrc?: string;
  eventLocation?: string;
  eventOrganizer?: string;
  requestorId: string;
  firstName?: string;
  lastName?: string;
  startTime: string;
  endTime: string;
  eventDescription?: string;
  status?: number;
  locale?: "en" | "fr";
}
