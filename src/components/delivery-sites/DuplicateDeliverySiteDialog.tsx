import { DeliverySiteFormType } from "@/hooks/useDeliverySiteForm";
import i18n from "@/i18n";
import { DeliverySite } from "@/types/DeliverySite";
import { cn } from "@/utils/cls-util";
import { Accessor, For, Setter, Show } from "solid-js";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal-dialog";
import { getFacilityFeatures } from "./DeliverySiteFeature";
import { DeliverySiteStatus } from "./DeliverySiteStatus";

type DuplicateDeliverySiteDialogProps = {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  formData: Accessor<DeliverySiteFormType>;
  duplicateSites: Accessor<DeliverySite[]>;
  confirmSave: () => void;
};

const generalCompare = (val1?: string, val2?: string) => {
  if (!val1 || !val2) return false;
  return val1.toLowerCase().replaceAll(/[^a-z0-9]/g, "") === val2.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
};

const DeliverySiteField = (props: { label: string; value?: string; formFieldValue?: string }) => {
  const duplicate = generalCompare(props.value, props.formFieldValue);
  return (
    <tr>
      <td class="py-2 pr-3 pl-4 text-xs whitespace-nowrap text-gray-600 sm:pl-0">{props.label}</td>
      <td class={cn("px-2 py-2 text-sm font-medium", duplicate ? "text-red-700" : "text-gray-900")}>{props.value}</td>
      <td class="px-2 py-2 text-sm whitespace-nowrap text-gray-900">
        <Show when={duplicate}>
          <svg
            aria-hidden="true"
            data-prefix="fas"
            data-icon="exclamation-triangle"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            class="h-4 w-4 text-red-700"
          >
            <path
              fill="currentColor"
              d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"
              class=""
            />
          </svg>
        </Show>
      </td>
    </tr>
  );
};

export const DuplicateDeliverySiteDialog = (props: DuplicateDeliverySiteDialogProps) => {
  const getPrimaryContact = (site: DeliverySite) => {
    const contact = (site.contacts ?? []).find((s) => s.primaryFlag === "Y");
    return `${contact?.firstName ?? ""} ${contact?.lastName ?? ""}`;
  };

  return (
    <Modal
      open={props.open()}
      showCloseButton={false}
      onClose={() => props.setOpen(false)}
      title={
        <div class="flex flex-row space-x-3">
          <div class="pt-1">
            <svg class="mx-auto h-9 w-9 text-red-600" fill="currentColor" viewBox="0 0 448 512" aria-hidden="true">
              <path
                d="M384 352l-160 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l108.1 0c4.2 0 8.3 1.7 11.3 4.7l67.9 67.9c3 3 4.7 7.1 4.7 11.3L416 320c0 17.7-14.3 32-32 32zM433.9 81.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L224 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l160 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l160 0c35.3 0 64-28.7 64-64l0-32-32 0 0 32c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0 0-32-64 0z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <h3 id="addEventFolder-modal-title" class="text-lg leading-6 font-medium text-gray-900">
              Possible Duplicate Entry
            </h3>
            <p class="text-sm text-gray-700">
              <span class="font-medium">{props.duplicateSites().length}</span> delivery site(s) with similar or exact
              details were found
            </p>
          </div>
        </div>
      }
      containerClass="flex-col"
      actions={
        <>
          <Button variant="default" onClick={() => props.confirmSave()}>
            Ignore warning and proceed
          </Button>
          <Button variant={"outlined"} onClick={() => props.setOpen(false)}>
            {i18n.t("common.cancel")}
          </Button>
        </>
      }
    >
      <div class="max-h-[475px] overflow-y-auto">
        <For each={props.duplicateSites()}>
          {(site) => (
            <div class="mt-4 overflow-x-auto rounded-sm border border-gray-200 bg-gray-50 px-4 pb-2">
              <table class="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold whitespace-nowrap text-gray-900 sm:pl-0"
                    >
                      Data element
                    </th>
                    <th scope="col" class="px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap text-gray-900">
                      Value
                    </th>
                    <th
                      scope="col"
                      class="sr-only px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap text-gray-900"
                    >
                      Warning
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr>
                    <td class="py-2 pr-3 pl-4 text-xs whitespace-nowrap text-gray-600 sm:pl-0">Delivery Site ID</td>
                    <td class="px-2 py-2 text-sm font-medium text-gray-900">{site.deliverySiteId}</td>
                    <td class="px-2 py-2 text-sm whitespace-nowrap text-gray-900" />
                  </tr>
                  <DeliverySiteField
                    label="Delivery Site Name"
                    value={site.deliverySiteName}
                    formFieldValue={props.formData().deliverySiteName}
                  />
                  <tr>
                    <td class="py-2 pr-3 pl-4 text-xs whitespace-nowrap text-gray-600 sm:pl-0">Delivery Site Status</td>
                    <td class="px-2 py-2 text-sm font-medium text-gray-900">
                      <DeliverySiteStatus status={site.status} />
                    </td>
                    <td class="px-2 py-2 text-sm whitespace-nowrap text-gray-900" />
                  </tr>

                  <DeliverySiteField
                    label={i18n.t("deliverySite.fields.address.label")}
                    value={site.address}
                    formFieldValue={props.formData().address}
                  />

                  <DeliverySiteField
                    label={i18n.t("deliverySite.fields.address2.label")}
                    value={site.address2}
                    formFieldValue={props.formData().address2}
                  />

                  <DeliverySiteField
                    label={i18n.t("deliverySite.fields.city.label")}
                    value={site.city}
                    formFieldValue={props.formData().city}
                  />

                  <DeliverySiteField
                    label={i18n.t("deliverySite.fields.postalCode.label")}
                    value={site.postalCode}
                    formFieldValue={props.formData().postalCode}
                  />

                  <tr>
                    <td class="py-2 pr-3 pl-4 text-xs whitespace-nowrap text-gray-600 sm:pl-0">
                      Province/State/Region
                    </td>
                    <td class="px-2 py-2 text-sm font-medium text-gray-900">{site.province?.provinceName}</td>
                    <td class="px-2 py-2 text-sm whitespace-nowrap text-gray-900" />
                  </tr>

                  <tr>
                    <td class="py-2 pr-3 pl-4 text-xs whitespace-nowrap text-gray-600 sm:pl-0">Country</td>
                    <td class="px-2 py-2 text-sm font-medium text-gray-900">{site.country}</td>
                    <td class="px-2 py-2 text-sm whitespace-nowrap text-gray-900" />
                  </tr>

                  <tr>
                    <td class="py-2 pr-3 pl-4 text-xs whitespace-nowrap text-gray-600 sm:pl-0">Primary Contact</td>
                    <td class="px-2 py-2 text-sm font-medium text-gray-900">{getPrimaryContact(site)}</td>
                    <td class="px-2 py-2 text-sm whitespace-nowrap text-gray-900" />
                  </tr>

                  <tr>
                    <td class="py-2 pr-3 pl-4 text-xs whitespace-nowrap text-gray-600 sm:pl-0">Facility features</td>
                    <td class="flex flex-wrap gap-2 px-2 py-2 text-sm font-medium text-gray-900">
                      <For each={getFacilityFeatures(site)}>{(s) => <span>{s}</span>}</For>
                    </td>
                    <td class="px-2 py-2 text-sm whitespace-nowrap text-gray-900" />
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </For>
      </div>
    </Modal>
  );
};
