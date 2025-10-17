import i18n from "@/i18n";
import { createForm, zodForm } from "@modular-forms/solid";
import dayjs from "dayjs";
import { z } from "zod";

export type ContactFormType = {
  contactId?: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  extension?: string;
  email?: string;
};

export type DeliverySiteFormType = {
  deliverySiteId?: number;
  status?: string;
  // Location info
  deliverySiteName?: string;
  address?: string;
  address2?: string;
  city?: string;
  provinceId?: string;
  requestorId?: number;
  orgId?: number;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;

  // Facility features
  standardFreezerFlag?: string;
  ultraLowFlag?: string;
  heatingFlag?: string;
  coolingFlag?: string;
  loadingDockExists?: string;
  palletRackingFlag?: string;
  delFacilityFlag?: string;
  delFacilityNumber?: string;
  activityEndDateFlag?: string;
  activityEndDate?: string;

  deliveryInstructions?: string;

  contacts?: ContactFormType[];
  fileIds?: string[];
};

// Create Zod validation schema
const deliverySiteSchema = z
  .object({
    requestorId: z.number().optional(),
    orgId: z.number().optional(),
    status: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.status.label") })}`),
    // Location info
    deliverySiteName: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.deliverySiteName.label") })}`)
      .transform((val) => val.trim()),
    address: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.address.label") })}`)
      .transform((val) => val.trim()),
    address2: z
      .string()
      .transform((val) => val.trim())
      .optional(),
    city: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.city.label") })}`)
      .transform((val) => val.trim()),
    provinceId: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.province.label") })}`),
    postalCode: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.postalCode.label") })}`)
      .transform((val) => val.trim()),
    country: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.country.label") })}`),
    latitude: z.number().optional(),
    longitude: z.number().optional(),

    // Facility features
    standardFreezerFlag: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.features.standardFreezerFlag") })}`),
    ultraLowFlag: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.features.ultraLowFlag") })}`),
    heatingFlag: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.features.heatingFlag") })}`),
    coolingFlag: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.features.coolingFlag") })}`),
    loadingDockExists: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.features.loadingDockExists") })}`),
    palletRackingFlag: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.features.palletRackingFlag") })}`),
    delFacilityFlag: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.features.delFacilityFlag") })}`),
    delFacilityNumber: z
      .string()
      .transform((val) => val.trim())
      .optional(),
    activityEndDateFlag: z
      .string()
      .nonempty(`${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.features.activityEndDateFlag") })}`),
    activityEndDate: z.string().optional(),
    deliveryInstructions: z
      .string()
      .transform((val) => val.trim())
      .optional(),

    contacts: z.array(
      z.object({
        firstName: z
          .string()
          .nonempty(
            `${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.contact.firstName.label") })}`,
          ),
        lastName: z
          .string()
          .nonempty(
            `${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.contact.lastName.label") })}`,
          ),
        phoneNumber: z
          .string()
          .nonempty(
            `${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.contact.phoneNumber.label") })}`,
          )
          .regex(/^[+\-()0-9]+$/, i18n.t("validation.phoneNumber")),
        extension: z
          .string()
          .optional()
          .refine((val) => val === undefined || val === "" || /^[0-9]+$/.test(val), {
            message: i18n.t("validation.phoneExtension"),
          }),
        email: z
          .string()
          .nonempty(i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.contact.email.label") }))
          .pipe(z.email(i18n.t("validation.email"))),
      }),
    ),
    fileIds: z.array(z.string()).optional(),
  })
  .refine(
    ({ delFacilityFlag, delFacilityNumber }) => {
      if (delFacilityFlag === "Y") {
        return delFacilityNumber?.trim(); // Must be truthy (not empty/null/undefined)
      }
      return true;
    },
    {
      path: ["delFacilityNumber"],
      message: `${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.delFacilityNumber.label") })}`,
    },
  )
  .refine(
    ({ activityEndDateFlag, activityEndDate }) => {
      if (activityEndDateFlag === "Y") {
        return activityEndDate?.trim();
      }
      return true;
    },
    {
      path: ["activityEndDate"],
      message: `${i18n.t("validation.required", { fieldName: i18n.t("deliverySite.fields.activityEndDate.label") })}`,
    },
  )
  .refine(
    ({ activityEndDateFlag, activityEndDate }) => {
      if (activityEndDateFlag === "Y") {
        const dateFormat = "MM/DD/YYYY";
        const strDateVal = activityEndDate?.trim();
        const dayjsVal = dayjs(strDateVal, dateFormat);
        return dayjsVal.isValid() && strDateVal === dayjsVal.format(dateFormat);
      }
      return true;
    },
    {
      path: ["activityEndDate"],
      message: `${i18n.t("validation.date")}`,
    },
  );

export type useDeliverySiteFormProps = {
  initialValues: DeliverySiteFormType;
};

export const useDeliverSiteForm = (initialValues: DeliverySiteFormType) => {
  return createForm<DeliverySiteFormType>({
    initialValues,
    // @ts-expect-error can not fix this error
    validate: zodForm(deliverySiteSchema),
  });
};
