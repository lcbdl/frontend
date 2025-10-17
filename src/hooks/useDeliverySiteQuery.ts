// hooks/useDeliverySiteQuery.ts
import { useApi } from "@/context/api-context";
import i18n from "@/i18n";
import { DeliverySite, DeliverySiteStatusType } from "@/types/DeliverySite";
import { DeliverySiteAttachment } from "@/types/DeliverySiteAttachment";
import { DeliverySiteContact } from "@/types/DeliverySiteContact";
import { delay } from "@/utils/common-utils";
import { useQueryClient } from "@tanstack/solid-query";
import { DeliverySiteFormType } from "./useDeliverySiteForm";

// Mock data, delete this when using real API
const MOCK_DATA: DeliverySite[] = Array.from({ length: 200 }, (_, i) => ({
  deliverySiteId: i + 1,
  deliverySiteNameEng: `Site ${i + 1}`,
  activityEndDate: `2024-12-${String((i % 28) + 1).padStart(2, "0")}`,
  ultraLowFlag: i % 2 === 0 ? "Y" : "N",
  delFacilityFlag: i % 3 === 0 ? "Y" : "N",
  delFacilityNumber: `DFN${1000 + i}`,
  address: `${i + 1} Main St`,
  city: `City${(i % 10) + 1}`,
  postalCode: `PC${String(i).padStart(4, "0")}`,
  province: { provinceShortName: `Province${(i % 5) + 1}` },
  state: `State${(i % 3) + 1}`,
  country: "CountryX",
  latitude: 45 + (i % 10) * 0.1,
  longitude: -75 - (i % 10) * 0.1,
  deliveryInstructions: `Instructions for site ${i + 1}`,
  loadingDockExists: i % 4 === 0 ? "Y" : "N",
  creationDate: `2024-01-${String((i % 28) + 1).padStart(2, "0")}`,
  createdBy: `user${(i % 5) + 1}`,
  lastUpdateDate: `2024-06-${String((i % 28) + 1).padStart(2, "0")}`,
  lastUpdatedBy: `user${(i % 3) + 1}`,
  status: (i % 4 === 0 ? "A" : i % 4 === 1 ? "O" : 1 % 4 === 2 ? "C" : "U") as DeliverySiteStatusType,
  palletRackingFlag: i % 2 === 0 ? "Y" : "N",
  standardFreezerFlag: i % 3 === 0 ? "Y" : "N",
  heatingFlag: i % 4 === 0 ? "Y" : "N",
  coolingFlag: i % 5 === 0 ? "Y" : "N",
  contacts: [
    {
      contactId: 1,
      emailAddress: "someone@gmail.com",
      firstName: "Tom",
      lastName: "Woods",
      phoneNumber: "222-222-2222",
      primaryFlag: "Y",
    },
  ] as DeliverySiteContact[],
  attachments: [
    {
      fileName: "testfile.pdf",
      attachmentId: 1001,
      mimeType: "application/pdf",
      fileSize: 1024 * 1024,
    },
    {
      fileName: "beautiful lake.pdf",
      attachmentId: 1002,
      fileSize: 2.5 * 1024 * 1024,
    },
  ] as DeliverySiteAttachment[],
}));

export async function getMockData(): Promise<{ data: DeliverySite[] }> {
  delay(300);
  return { data: MOCK_DATA };
}

const preprocessNulls = <T>(data: T): T => {
  if (typeof data !== "object" || data === null) return data;
  const newData: any = {};
  for (const [key, value] of Object.entries(data)) {
    newData[key] = value === null ? "" : value;
  }
  return newData;
};

export const fromApiResponse = (data: any): DeliverySite => {
  const site = preprocessNulls(data);
  site.contacts = site.contacts.map((c: any) => preprocessNulls(c));
  return {
    deliverySiteId: site.deliverySiteId,
    requestor: site.requestor
      ? {
          requestorId: site.requestor.requestorId,
          requestorName: i18n.language === "fr" ? site.requestor.requestorNameFrc : site.requestor.requestorNameEng,
          shortName: i18n.language === "fr" ? site.requestor.shortNameFrc : site.requestor.shortNameEng,
        }
      : undefined,
    deliverySiteName: i18n.language === "fr" ? site.deliverySiteNameFrc : site.deliverySiteNameEng,

    activityEndDate: site.activityEndDate,
    ultraLowFlag: site.ultraLowFlag,
    delFacilityFlag: site.delFacilityFlag,
    delFacilityNumber: site.delFacilityNumber,
    address: site.address,
    address2: site.address2,
    city: site.city,
    postalCode: site.postalCode,
    province: site.province
      ? {
          provinceId: site.province.provinceId,
          provinceName: i18n.language === "fr" ? site.province.provinceNameFrc : site.province.provinceNameEng,
          provinceShortName:
            i18n.language === "fr" ? site.province.provinceShortNameFrc : site.province.provinceShortNameEng,
        }
      : undefined,
    state: site.state,
    country: site.country,
    latitude: site.latitude,
    longitude: site.longitude,
    deliveryInstructions: site.deliveryInstructions,
    loadingDockExists: site.loadingDockExists,
    orgId: site.orgId,
    creationDate: site.creationDate,
    createdBy: site.createdBy,
    lastUpdateDate: site.lastUpdateDate,
    lastUpdatedBy: site.lastUpdatedBy,
    status: site.status,
    palletRackingFlag: site.palletRackingFlag,
    standardFreezerFlag: site.standardFreezerFlag,
    heatingFlag: site.heatingFlag,
    coolingFlag: site.coolingFlag,
    siteNumber: site.siteNumber,
    contacts: site.contacts.map((c: any) => {
      const nameArr: string[] = (c.contactName ?? "").split(" ");
      const firstName = nameArr[0];
      const lastName = nameArr.length > 1 ? nameArr[nameArr.length - 1] : "";
      return {
        deliverySiteContactId: c.deliverySiteContactId,
        firstName: firstName,
        lastName: lastName,
        primaryFlag: c.primaryFlag,
        phoneNumber: c.phoneNumber,
        emailAddress: c.emailAddress,
        extension: c.extension,
      };
    }),
    attachments: site.attachments || [],
  };
};

export const toDeliverySiteForm = (site: DeliverySite): DeliverySiteFormType => ({
  activityEndDate: site.activityEndDate,
  activityEndDateFlag: site.activityEndDate !== "" ? "Y" : "N",
  address: site.address,
  city: site.city,
  coolingFlag: site.coolingFlag,
  country: site.country,
  delFacilityFlag: site.delFacilityFlag,
  delFacilityNumber: site.delFacilityNumber,
  deliveryInstructions: site.deliveryInstructions,
  deliverySiteName: site.deliverySiteName,
  heatingFlag: site.heatingFlag,
  latitude: site.latitude,
  loadingDockExists: site.loadingDockExists,
  longitude: site.longitude,
  palletRackingFlag: site.palletRackingFlag,
  postalCode: site.postalCode,
  provinceId: site.province?.provinceId?.toString(),
  standardFreezerFlag: site.standardFreezerFlag,
  state: site.state,
  status: site.status,
  ultraLowFlag: site.ultraLowFlag,
  contacts: (site.contacts ?? []).map((c) => ({
    contactId: c.contactId,
    email: c.emailAddress,
    extension: c.extension,
    firstName: c.firstName,
    lastName: c.lastName,
    phoneNumber: c.phoneNumber,
  })),
});

export const useDeliverySiteQuery = (param?: { deliverySiteId?: number }) => {
  const { deliverySiteId } = param ?? {};
  const api = useApi();
  const queryClient = useQueryClient();

  const findDeliverySiteById = async (): Promise<DeliverySite> => {
    if (!deliverySiteId) {
      throw new Error("Delivery site ID is required");
    }

    // get mock data
    const data = (await getMockData()).data[0];
    // get data from API
    //const data = (await api.get(`/delivery-sites/${deliverySiteId}`)).data as any;
    return fromApiResponse(data);
  };

  const findDeliverySites = async (): Promise<DeliverySite[]> => {
    // get mock data
    const data = (await getMockData()).data;
    // get data from API
    //const data = (await api.get("/delivery-sites")).data as any[];
    return data.map((item) => fromApiResponse(item));
  };

  const checkDuplicate = async (deliverySite: DeliverySiteFormType): Promise<DeliverySite[]> => {
    const data = (await api.post("/delivery-sites/duplicate", deliverySite)).data as any[];
    return (data ?? []).map((item) => fromApiResponse(item));
  };

  const findCityNames = async (query: string, top?: number) => {
    const topQuery = !!top ? `&top=${encodeURIComponent(top)}` : "";
    const data = (await api.get<string[]>(`/delivery-sites/city-names?query=${encodeURIComponent(query)}${topQuery}`))
      .data;
    return data;
  };

  const findDeliverySiteNames = async (query: string, top?: number) => {
    const topQuery = !!top ? `&top=${encodeURIComponent(top)}` : "";
    const data = (await api.get<string[]>(`/delivery-sites/names?query=${encodeURIComponent(query)}${topQuery}`)).data;
    return data;
  };

  const findAllStatus = async () => {
    return (await api.get<string[]>("/delivery-sites/status")).data;
  };

  return {
    findDeliverySiteById,
    findDeliverySites,
    findCityNames,
    findDeliverySiteNames,
    findAllStatus,
    checkDuplicate,
    api,
    queryClient,
  };
};
