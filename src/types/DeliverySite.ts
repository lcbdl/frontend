import { DeliverySiteAttachment } from "./DeliverySiteAttachment";
import { DeliverySiteContact } from "./DeliverySiteContact";
import { Province } from "./Province";
import { Requestor } from "./Requestor";

export type DeliverySiteStatusType = "A" | "I" | "U" | "C";

export interface DeliverySite {
  deliverySiteId?: number;
  requestor?: Requestor;
  deliverySiteName?: string;
  activityEndDate?: string;
  delFacilityNumber?: string;
  address?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  province?: Province;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string;
  orgId?: number;
  creationDate?: string;
  createdBy?: string;
  lastUpdateDate?: string;
  lastUpdatedBy?: string;
  status?: DeliverySiteStatusType;

  loadingDockExists?: string;
  ultraLowFlag?: string;
  delFacilityFlag?: string;
  palletRackingFlag?: string;
  standardFreezerFlag?: string;
  heatingFlag?: string;
  coolingFlag?: string;
  siteNumber?: string;
  contacts?: DeliverySiteContact[];
  attachments?: DeliverySiteAttachment[];
}
