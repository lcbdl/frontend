import { DeliverySiteFormType, useDeliverSiteForm } from "@/hooks/useDeliverySiteForm";
import { toDeliverySiteForm, useDeliverySiteQuery } from "@/hooks/useDeliverySiteQuery";
import { getErrors, getValue, insert, remove, reset, setError, setValues, SubmitHandler } from "@modular-forms/solid";

import { useUnsavedChangesContext } from "@/context/UnsavedChangesContext";
import i18n from "@/i18n";
import { DeliverySite } from "@/types/DeliverySite";
import { DeliverySiteAttachment } from "@/types/DeliverySiteAttachment";
import { cn } from "@/utils/cls-util";
import { useMutation, useQuery } from "@tanstack/solid-query";
import { omit } from "lodash";
import { createEffect, createMemo, createSignal, For, Match, on, Show, Switch } from "solid-js";
import { FileUpload } from "../FileUpload";
import { DateField } from "../ui/form-fields/date-field";
import { SelectField } from "../ui/form-fields/select-field";
import { TextArea } from "../ui/form-fields/text-area-field";
import { TextField } from "../ui/form-fields/text-field";
import Loading from "../ui/loading";
import { ShowError } from "../ui/ShowError";
import { useSnackbar } from "../ui/snackbar";
import { DeliverySiteAttachmentsFiles } from "./DeliverySiteAttachmentFiles";
import { DuplicateDeliverySiteDialog } from "./DuplicateDeliverySiteDialog";

// Helper function to create an empty delivery site object
const createEmptyDeliverySite = (): DeliverySiteFormType => ({
  deliverySiteName: "",
  ultraLowFlag: "",
  delFacilityFlag: "",
  delFacilityNumber: "",
  address: "",
  address2: "",
  city: "",
  postalCode: "",
  provinceId: "",
  orgId: 2,
  requestorId: undefined,
  country: "",
  latitude: undefined,
  longitude: undefined,
  deliveryInstructions: "",
  loadingDockExists: "",
  activityEndDateFlag: "",
  activityEndDate: "",
  status: "",
  palletRackingFlag: "",
  standardFreezerFlag: "",
  heatingFlag: "",
  coolingFlag: "",
  contacts: [{ firstName: "", lastName: "", email: "", phoneNumber: "", extension: "" }],
  fileIds: [],
});

export type EditDeliverySiteProps = {
  deliverySiteId?: number;
};

const isTestEnv = import.meta.env?.MODE === "test";

const currentRequestorId = document.getElementById("current_requestor_id")?.dataset.current_requestor_id;

export const EditDeliverySite = (props: EditDeliverySiteProps) => {
  const { findDeliverySiteById, checkDuplicate, api, queryClient } = useDeliverySiteQuery({
    deliverySiteId: props.deliverySiteId,
  });
  const snackbar = useSnackbar();

  const [attachments, setAttachments] = createSignal<DeliverySiteAttachment[] | undefined>([]);
  const [formData, setFormData] = createSignal<DeliverySiteFormType>({});
  const [duplicateSites, setDuplicateSites] = createSignal<DeliverySite[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = createSignal(false);
  const [clearAllFilesTrigger, setClearAllFilesTrigger] = createSignal(0);

  const queryById = useQuery(() => ({
    queryKey: ["deliverySite", props.deliverySiteId],
    queryFn: findDeliverySiteById,
    retry: isTestEnv ? false : 3,
    enabled: props.deliverySiteId !== undefined,
  }));

  const checkDuplicateMutation = useMutation(() => ({
    mutationFn: checkDuplicate,
  }));

  const addMutation = useMutation(() => ({
    mutationFn: async (newSite: DeliverySiteFormType) => {
      const response = await api.post<DeliverySite>("/delivery-sites", newSite);
      console.log("response : ", response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverySites"] });

      snackbar.open({
        message: "Delivery site was created!",
        variant: "success",
        autoHideDuration: 5000,
      });

      forceNavigate("/");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to create delivery site. Please try again.";
      snackbar.open({
        message,
        variant: "error",
        autoHideDuration: 7000,
      });
    },
  }));

  const updateMutation = useMutation(() => ({
    mutationFn: async (newSite: DeliverySiteFormType) => {
      const response = await api.update<DeliverySite>(`/delivery-sites/${props.deliverySiteId}`, newSite);
      console.log("response : ", response.data);
      return response.data;
    },
    onSuccess: (savedSite: DeliverySite) => {
      queryClient.invalidateQueries({ queryKey: ["deliverySites"] });

      reset(deliverySiteForm, { initialValues: toDeliverySiteForm(savedSite) });
      setAttachments(savedSite.attachments);

      snackbar.open({
        message: "Delivery site was updated!",
        variant: "success",
        autoHideDuration: 5000,
      });
      forceNavigate("/");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update delivery site. Please try again.";
      snackbar.open({
        message,
        variant: "error",
        autoHideDuration: 7000,
      });
    },
  }));

  const deleteAttachmentMutation = useMutation(() => ({
    mutationFn: async (attachmentId: number) => {
      await api.delete(`/delivery-sites/${props.deliverySiteId}/attachments/${attachmentId}`);
      return attachmentId;
    },
    onSuccess: (result) => {
      setAttachments((prev) => prev?.filter((att) => att.attachmentId !== result));
      snackbar.open({
        message: "Attachment was deleted!",
        variant: "success",
        autoHideDuration: 5000,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update delivery site. Please try again.";
      snackbar.open({
        message,
        variant: "error",
        autoHideDuration: 7000,
      });
    },
  }));

  // Initialize form with empty data
  const [deliverySiteForm, { Form, Field, FieldArray }] = useDeliverSiteForm(createEmptyDeliverySite());

  // pass the form's dirty state to the context
  const { forceNavigate, safeCall } = useUnsavedChangesContext(() => deliverySiteForm.dirty);

  const hasFormArrayErrors = (index: number) => {
    const errors = getErrors(deliverySiteForm);
    const contactFieldNames = Object.keys(errors).filter((k) => k.startsWith(`contacts.${index}`));
    // @ts-expect-error use index
    return contactFieldNames.some((k) => errors[k] && errors[k].length > 0);
  };

  // Reset form when query data changes
  createEffect(
    on(
      () => [props.deliverySiteId, queryById.data],
      ([id, data]) => {
        if (id && data) {
          const values = toDeliverySiteForm(data as DeliverySite);
          setValues(deliverySiteForm, toDeliverySiteForm(data as DeliverySite));
          setAttachments((data as DeliverySite).attachments);
          reset(deliverySiteForm, {
            initialValues: values,
          });
        }
      },
      { defer: true }, // avoid immediate run on mount
    ),
  );

  const handleSubmit: SubmitHandler<DeliverySiteFormType> = async (values) => {
    const newValues: DeliverySiteFormType = {
      deliverySiteId: props.deliverySiteId,
      ...values,
      requestorId: currentRequestorId ? parseInt(currentRequestorId) : 3,
      orgId: 2,
    };

    const duplicates = await checkDuplicateMutation.mutateAsync(newValues);
    if (duplicates.length > 0) {
      const duplicateSiteName =
        duplicates.filter((site) => site.deliverySiteName === newValues.deliverySiteName).length > 0;
      if (duplicateSiteName) {
        setError(deliverySiteForm, "deliverySiteName", "Delivery site name already in use");
      } else {
        setDuplicateSites(duplicates);
        setFormData(newValues);
        setShowDuplicateDialog(true);
      }
    } else {
      if (isEditMode()) {
        updateMutation.mutate(newValues);
      } else {
        addMutation.mutate(newValues);
      }
    }
  };

  const confirmSave = () => {
    setShowDuplicateDialog(false);
    const data = formData();
    if (data) {
      if (isEditMode()) {
        updateMutation.mutate(data);
      } else {
        addMutation.mutate(data);
      }
    }
  };

  const handleDeleteAttachment = (attachmentId: number | undefined) => {
    if (attachmentId) {
      deleteAttachmentMutation.mutate(attachmentId);
    }
  };

  const isEditMode = createMemo(() => props.deliverySiteId !== undefined);
  const isLoading = createMemo(() => isEditMode() && queryById.isLoading);
  const isError = createMemo(() => isEditMode() && queryById.isError);
  return (
    <>
      <Switch
        fallback={
          <div>
            <Form class="space-y-0 divide-y divide-gray-200" onSubmit={handleSubmit}>
              {/*  Delivery Site Address Block */}
              <div class="space-y-8 pb-8">
                <div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">{i18n.t("deliverySite.addressTitle")}</h3>
                  <p class="mt-1 text-sm text-gray-500">{i18n.t("deliverySite.addressSubTitle")}</p>
                </div>
                <div class="grid grid-cols-12 gap-6">
                  {/*  Delivery site name */}
                  <div class="col-span-12 sm:col-span-8">
                    <Field name="deliverySiteName" type="string">
                      {(field, props) => (
                        <TextField
                          type="text"
                          {...props}
                          name="deliverySiteName"
                          label={i18n.t("deliverySite.fields.deliverySiteName.label")}
                          value={field.value}
                          error={field.error}
                          placeholder="Eg. East coast warehouse"
                          required
                        />
                      )}
                    </Field>
                  </div>

                  {/*  Delivery site status */}
                  <div class="col-span-6 sm:col-span-4">
                    <Field name="status">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label={i18n.t("deliverySite.fields.status.label")}
                          placeholder="Select status"
                          value={field.value ?? ""}
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          required
                          options={[
                            { value: "A", label: "Active" },
                            { value: "I", label: "Inactive" },
                            { value: "U", label: "Unknown" },
                            { value: "C", label: "Classified" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  Address. */}
                  <div class="col-span-12 sm:col-span-10">
                    <Field name="address" type="string">
                      {(field, props) => (
                        <TextField
                          type="text"
                          {...props}
                          name="address"
                          label="Address"
                          value={field.value}
                          error={field.error}
                          required
                        />
                      )}
                    </Field>
                  </div>
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="address2" type="string">
                      {(field, props) => (
                        <TextField
                          type="text"
                          {...props}
                          name="address2"
                          label="Unit/Suite/Apt"
                          value={field.value}
                          error={field.error}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  City */}
                  <div class="col-span-6 sm:col-span-4">
                    <Field name="city" type="string">
                      {(field, props) => (
                        <TextField
                          type="text"
                          {...props}
                          name="city"
                          label="City"
                          value={field.value}
                          error={field.error}
                          required
                        />
                      )}
                    </Field>
                  </div>

                  {/*  Postal Code */}
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="postalCode" type="string">
                      {(field, props) => (
                        <TextField
                          type="text"
                          {...props}
                          name="postalCode"
                          label="Postal/ZIP Code"
                          value={field.value}
                          error={field.error}
                          required
                        />
                      )}
                    </Field>
                  </div>

                  {/*  Province */}
                  <div class="col-span-6 sm:col-span-3">
                    <Field name="provinceId" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="Province/State/Region"
                          placeholder="Select province"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "6", label: "Alberta" },
                            { value: "7", label: "British Columbia" },
                            { value: "8", label: "Manitoba" },
                            { value: "9", label: "New Brunswick" },
                            { value: "10", label: "Newfoundland and Labrador" },
                            { value: "11", label: "Northwest Territories" },
                            { value: "12", label: "Nova Scotia" },
                            { value: "13", label: "Nunavut" },
                            { value: "14", label: "Ontario" },
                            { value: "15", label: "Prince Edward Island" },
                            { value: "16", label: "Quebec" },
                            { value: "17", label: "Saskatchewan" },
                            { value: "18", label: "Yukon" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  Country */}
                  <div class="col-span-6 sm:col-span-3">
                    <Field name="country" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="Country"
                          autocomplete="country"
                          placeholder="Select country"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "Canada", label: "Canada" },
                            { value: "United States", label: "United States" },
                            { value: "Mexico", label: "Mexico" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>
                </div>
              </div>

              {/*  Facility Features Block */}
              <div class="space-y-8 pb-8">
                <div class="pt-8">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Facility features</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Below you can identify the features of the delivery site along with its applicable Drug
                    Establishment License (DEL) number.
                  </p>
                </div>

                <div class="grid grid-cols-12 gap-6">
                  {/*  Standard Freezers */}
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="standardFreezerFlag" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="Standard Freezers"
                          placeholder="Select"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "Y", label: "Y" },
                            { value: "N", label: "N" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  ULT Freezers */}
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="ultraLowFlag" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="ULT Freezers"
                          placeholder="Select"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "Y", label: "Y" },
                            { value: "N", label: "N" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  Heating */}
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="heatingFlag" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="Heating"
                          placeholder="Select"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "Y", label: "Y" },
                            { value: "N", label: "N" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  Cooling */}
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="coolingFlag" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="Cooling"
                          placeholder="Select"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "Y", label: "Y" },
                            { value: "N", label: "N" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  Loading Dock */}
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="loadingDockExists" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="Loading Dock"
                          placeholder="Select"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "Y", label: "Y" },
                            { value: "N", label: "N" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  Pallet Racking */}
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="palletRackingFlag" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="Pallet Racking"
                          placeholder="Select"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "Y", label: "Y" },
                            { value: "N", label: "N" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  DEL License */}
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="delFacilityFlag" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="DEL License"
                          placeholder="Select"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "Y", label: "Y" },
                            { value: "N", label: "N" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  DEL Number */}
                  <div class="col-span-6 sm:col-span-3">
                    <Field name="delFacilityNumber" type="string">
                      {(field, props) => {
                        const delFacilityFlag = getValue(deliverySiteForm, "delFacilityFlag");
                        return (
                          <TextField
                            type="text"
                            {...props}
                            name="delFacilityNumber"
                            label="DEL Number"
                            value={field.value}
                            error={field.error}
                            disabled={delFacilityFlag !== "Y"}
                            required={delFacilityFlag === "Y"}
                          />
                        );
                      }}
                    </Field>
                  </div>

                  {/*  Planned End Date */}
                  <div class="col-span-6 sm:col-span-2">
                    <Field name="activityEndDateFlag" type="string">
                      {(field, props) => (
                        <SelectField
                          {...props}
                          label="Planned End Date"
                          placeholder="Select"
                          value={field.value ?? ""}
                          required
                          multiple={false}
                          onChange={(field as any).setValue}
                          error={field.error}
                          options={[
                            { value: "Y", label: "Y" },
                            { value: "N", label: "N" },
                          ]}
                        />
                      )}
                    </Field>
                  </div>

                  {/*  End Date */}
                  <div class="col-span-6 sm:col-span-3">
                    <Field name="activityEndDate" type="string">
                      {(field, props) => {
                        const activityEndDateFlag = getValue(deliverySiteForm, "activityEndDateFlag");
                        return (
                          <DateField
                            {...omit(props, "onChange")}
                            required={activityEndDateFlag === "Y"}
                            name="activityEndDate"
                            label="End Date"
                            value={field.value}
                            error={field.error}
                            disabled={activityEndDateFlag !== "Y"}
                            onInput={(e) => {
                              props.onInput(e);
                            }}
                          />
                        );
                      }}
                    </Field>
                  </div>
                </div>
              </div>

              {/*  Contact Information Block */}
              <div class="space-y-8 pb-8">
                <div class="pt-8">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Contact information</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Enter the contact information of the receiving individual(s).
                  </p>
                </div>

                {/*  Contact Information */}
                <div class="divide-y divide-gray-200">
                  <FieldArray name="contacts">
                    {(fieldArray) => (
                      <For each={fieldArray.items}>
                        {(_, index) => (
                          <div class={cn("grid grid-cols-12 gap-5", index() === 0 ? "pb-5" : "py-5")}>
                            <div class="col-span-6 sm:col-span-2">
                              <Field name={`contacts.${index()}.firstName`}>
                                {(field, props) => (
                                  <TextField
                                    type="text"
                                    {...props}
                                    label="First Name"
                                    value={field.value}
                                    required
                                    error={field.error}
                                  />
                                )}
                              </Field>
                            </div>
                            <div class="col-span-6 sm:col-span-2">
                              <Field name={`contacts.${index()}.lastName`}>
                                {(field, props) => (
                                  <TextField
                                    type="text"
                                    {...props}
                                    label="Last Name"
                                    value={field.value}
                                    error={field.error}
                                    required
                                  />
                                )}
                              </Field>
                            </div>

                            <div class="col-span-4 sm:col-span-2">
                              <Field name={`contacts.${index()}.phoneNumber`}>
                                {(field, props) => (
                                  <TextField
                                    type="text"
                                    {...props}
                                    label="Phone number"
                                    value={field.value}
                                    error={field.error}
                                    required
                                  />
                                )}
                              </Field>
                            </div>
                            <div class={cn("sm:col-span-2", index() === 0 ? "col-span-3" : "col-span-2")}>
                              <Field name={`contacts.${index()}.extension`}>
                                {(field, props) => (
                                  <TextField
                                    type="text"
                                    {...props}
                                    label="Extension"
                                    value={field.value}
                                    error={field.error}
                                  />
                                )}
                              </Field>
                            </div>
                            <div class={index() === 0 ? "col-span-5 sm:col-span-4" : "col-span-4 sm:col-span-3"}>
                              <Field name={`contacts.${index()}.email`}>
                                {(field, props) => (
                                  <TextField
                                    type="text"
                                    {...props}
                                    label="Email Address"
                                    value={field.value}
                                    error={field.error}
                                    required
                                  />
                                )}
                              </Field>
                            </div>
                            <Show when={index() > 0}>
                              <div class="col-span-2 my-auto sm:col-span-1">
                                <button
                                  type="button"
                                  class={cn(
                                    "inline-flex flex-shrink-0 items-center rounded-md border-2 border-transparent text-sm font-medium text-gray-600 transition ease-in-out hover:bg-red-600 hover:text-white",
                                    !hasFormArrayErrors(index()) && "mt-6",
                                  )}
                                  onClick={() => {
                                    // Prevent deletion if only one contact remains
                                    if (fieldArray.items.length > 1) {
                                      remove(deliverySiteForm, "contacts", { at: index() });
                                    }
                                  }}
                                >
                                  <svg
                                    aria-hidden="true"
                                    class="m-1 h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 384 512"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      clip-rule="evenodd"
                                      fill-rule="evenodd"
                                      d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </Show>
                          </div>
                        )}
                      </For>
                    )}
                  </FieldArray>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    insert(deliverySiteForm, "contacts", {
                      value: { firstName: "", lastName: "", phoneNumber: "", extension: "", email: "" },
                    })
                  }
                  class="-mt-6 inline-flex items-center rounded-full border border-sky-700 bg-white px-2.5 py-0.5 text-sm leading-5 font-medium text-sky-700 transition ease-in-out hover:bg-sky-700 hover:text-white focus:ring-2 focus:ring-sky-700 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-none"
                >
                  <svg
                    aria-hidden="true"
                    class="mr-1 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 448 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M248 72c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 160L40 232c-13.3 0-24 10.7-24 24s10.7 24 24 24l160 0 0 160c0 13.3 10.7 24 24 24s24-10.7 24-24l0-160 160 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-160 0 0-160z"
                    />
                  </svg>
                  Add contact
                </button>
              </div>

              {/*  Additional Shipping Information Block */}
              <div class="space-y-8 pb-8">
                <div class="pt-8">
                  <div>
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Additional Shipping Information</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      Use this section to add any add any notes relating to this delivery site.
                    </p>
                  </div>

                  <div class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                    <div class="sm:col-span-6">
                      <Field name="deliveryInstructions">
                        {(field, props) => (
                          <TextArea
                            {...props}
                            rows="4"
                            placeholder="Enter text here..."
                            label="Enter shipping information"
                            labelClass="font-medium"
                            value={field.value}
                            onChange={(field as any).setValue}
                            error={field.error}
                          />
                        )}
                      </Field>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing attachments */}
              <Show when={isEditMode()}>
                {/* Attached Files */}
                <div class="col-span-12 sm:col-span-12">
                  <DeliverySiteAttachmentsFiles
                    title="Attachment files"
                    deliverySiteId={props.deliverySiteId}
                    attachments={attachments() ?? []}
                    deletable={true}
                    onDelete={handleDeleteAttachment}
                  />
                </div>
              </Show>
              {/* File Upload Block */}
              <div class="space-y-8 pb-8">
                <FileUpload
                  onComplete={(fileIds) => {
                    setValues(deliverySiteForm, "fileIds", fileIds);
                  }}
                  title="File Upload"
                  subtitle="Upload any file pertaining to this delivery site."
                  clearAllFilesTrigger={clearAllFilesTrigger}
                />
                <FieldArray name="fileIds">
                  {(fieldArray) => (
                    <For each={fieldArray.items}>
                      {(_, index) => (
                        <Field name={`fileIds.${index()}`}>
                          {(field, props) => <input type="hidden" {...props} value={field.value} />}
                        </Field>
                      )}
                    </For>
                  )}
                </FieldArray>
              </div>

              {/*  Footer Form Buttons */}
              <div class="pt-8">
                <div class="flex justify-end">
                  <button
                    type="button"
                    class="mb-4 inline-flex flex-shrink-0 items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition ease-in-out hover:bg-gray-50 hover:shadow-md focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-white focus:outline-none md:mb-0"
                    onClick={() => {
                      safeCall(() => {
                        // Set values back to "empty" template
                        reset(deliverySiteForm, {
                          initialValues:
                            isEditMode() && queryById.data
                              ? toDeliverySiteForm(queryById.data)
                              : createEmptyDeliverySite(),
                        });
                        setAttachments(isEditMode() && queryById.data ? queryById.data.attachments : []);
                        setClearAllFilesTrigger((v) => v + 1);
                      });
                    }}
                  >
                    Reset form
                  </button>
                  <button
                    type="submit"
                    class="mb-4 ml-3 inline-flex flex-shrink-0 items-center rounded-md border border-transparent bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition ease-in-out hover:bg-green-800 hover:shadow-md focus:ring-2 focus:ring-green-700 focus:ring-offset-2 focus:ring-offset-white focus:outline-none md:mb-0"
                    // disabled={deliverySiteForm.submitting || !deliverySiteForm.dirty}
                  >
                    <Show when={isEditMode()} fallback={<span>Add delivery site</span>}>
                      <span>Confirm Changes</span>
                    </Show>
                  </button>
                </div>
              </div>
            </Form>
          </div>
        }
      >
        <Match when={isEditMode() && isLoading()}>
          <Loading />
        </Match>
        <Match when={isEditMode() && isError()}>
          <ShowError class="text-lg" error={queryById.error?.message} />
        </Match>
      </Switch>
      <Show when={showDuplicateDialog() && duplicateSites().length > 0}>
        <DuplicateDeliverySiteDialog
          open={showDuplicateDialog}
          setOpen={setShowDuplicateDialog}
          formData={formData}
          duplicateSites={duplicateSites}
          confirmSave={confirmSave}
        />
      </Show>
    </>
  );
};
