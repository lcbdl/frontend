import { useDeliverySiteQuery } from "@/hooks/useDeliverySiteQuery";
import i18n from "@/i18n";
import { DeliverySite, DeliverySiteStatusType } from "@/types/DeliverySite";
import { useNavigate } from "@solidjs/router";
import { useQuery } from "@tanstack/solid-query";
import { createEffect, createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { Button } from "../ui/button";
import Loading from "../ui/loading";
import { Modal } from "../ui/modal-dialog";
import { ShowError } from "../ui/ShowError";
import { DeliverySiteAttachmentsFiles } from "./DeliverySiteAttachmentFiles";
import { getFacilityFeatures } from "./DeliverySiteFeature";
import { DeliverySiteStatus } from "./DeliverySiteStatus";

const isTestEnv = import.meta.env?.MODE === "test";

export const ViewDeliverySite = (props: { deliverySiteId: number }) => {
  const [open, setOpen] = createSignal(false);
  const navigate = useNavigate();

  const { findDeliverySiteById } = useDeliverySiteQuery({
    deliverySiteId: props.deliverySiteId,
  });

  const query = useQuery(() => ({
    queryKey: ["deliverySite", props.deliverySiteId],
    queryFn: findDeliverySiteById,
    retry: isTestEnv ? false : 3,
    enabled: false,
  }));

  createEffect(() => {
    if (open()) {
      // Run the query when dialog is open
      query.refetch();
    }
  });

  return (
    <>
      <Button
        variant="outlined"
        size="sm"
        class="hover:bg-gray-700 hover:text-white hover:shadow-gray-800/10 hover:ring-gray-900"
        onClick={() => setOpen(true)}
      >
        <svg
          aria-hidden="true"
          class="mr-2 h-4 w-4"
          fill="currentColor"
          viewBox="0 0 576 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
            fill-rule="evenodd"
          />
        </svg>
        {i18n.t("common.view")}
        <span class="sr-only">, {i18n.t("deliverySite.title")}</span>
      </Button>
      <Modal
        open={open()}
        onClose={() => setOpen(false)}
        // title={i18n.t("deliverySite.viewDeliverySite")}
        containerClass="flex-col"
        actions={
          <>
            <Button
              variant="default"
              onClick={() => {
                setOpen(false);
                navigate(`edit?id=${props.deliverySiteId}`);
              }}
            >
              {/* {i18n.t("common.editDetails")} */}
              {"Edit details"}
            </Button>
            <Button variant={"outlined"} onClick={() => setOpen(false)}>
              {i18n.t("common.close")}
            </Button>
          </>
        }
      >
        <Switch>
          <Match when={query.isLoading}>
            <Loading />
          </Match>
          <Match when={query.isError}>
            <ShowError class="text-lg" error={query.error?.message} />
          </Match>
          <Match when={query.isSuccess}>
            <DeliverySiteContent deliverySite={query.data} />
          </Match>
        </Switch>
      </Modal>
    </>
  );
};

export const DeliverySiteContent = (props: { deliverySite?: DeliverySite }) => {
  // const primaryContact = createMemo(() => (props.deliverySite?.contacts ?? []).find((c) => c.primaryFlag === "Y"));
  const features = createMemo(() => {
    return getFacilityFeatures(props.deliverySite ?? {});
  });

  return (
    <Show when={props.deliverySite} fallback={<ShowError error={i18n.t("common.noData")} />}>
      <div class="">
        {/* Header section with icon and info */}
        <div class="flex flex-row space-x-3">
          <div class="pt-1">
            <svg class="mx-auto h-9 w-9 text-sky-600" fill="currentColor" viewBox="0 0 384 512" aria-hidden="true">
              <path
                class=""
                d="M352 192c0-88.4-71.6-160-160-160S32 103.6 32 192c0 15.6 5.4 37 16.6 63.4c10.9 25.9 26.2 54 43.6 82.1c34.1 55.3 74.4 108.2 99.9 140c25.4-31.8 65.8-84.7 99.9-140c17.3-28.1 32.7-56.3 43.6-82.1C346.6 229 352 207.6 352 192zm32 0c0 87.4-117 243-168.3 307.2c-12.3 15.3-35.1 15.3-47.4 0C117 435 0 279.4 0 192C0 86 86 0 192 0S384 86 384 192zm-240 0a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm48 80a80 80 0 1 1 0-160 80 80 0 1 1 0 160z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <h3 id="addEventFolder-modal-title" class="text-lg leading-6 font-medium text-gray-900">
              {props.deliverySite?.deliverySiteName}
            </h3>
            <div class="flex flex-row space-x-3">
              <p class="my-auto text-sm text-gray-700">
                <svg
                  class="-mt-1 mr-1 inline-flex h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                >
                  <path
                    fill="currentColor"
                    d="M80 88c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 126.7c0 8.6 4.6 16.5 12 20.8s16.6 4.2 24-.1L320 153.8l0 70.9c0 8.8 4.8 16.8 12.5 21.1s17.1 3.9 24.5-.8l139.1-89L496 304l0 16 0 88c0 13.3-10.7 24-24 24l-368 0c-13.3 0-24-10.7-24-24l0-56 0-48L80 88zm8-56C57.1 32 32 57.1 32 88l0 216 0 48 0 56c0 39.8 32.2 72 72 72l368 0c39.8 0 72-32.2 72-72l0-88 0-16 0-148.1c0-37.9-41.9-60.9-73.9-40.4L368 180.8l0-27c0-37-40.2-60.1-72.2-41.5L192 172.9 192 88c0-30.9-25.1-56-56-56L88 32zm56 264c-8.8 0-16 7.2-16 16l0 48c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16l0-48c0-8.8-7.2-16-16-16l-48 0zm104 16l0 48c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16l0-48c0-8.8-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16zm136-16c-8.8 0-16 7.2-16 16l0 48c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16l0-48c0-8.8-7.2-16-16-16l-48 0z"
                    class=""
                  />
                </svg>
                Site No. {props.deliverySite?.siteNumber || "N/A"}
              </p>
              <DeliverySiteStatus status={(props.deliverySite?.status ?? "U") as DeliverySiteStatusType} />
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div class="my-4 h-[200px] rounded-lg border border-gray-200 bg-gray-50 px-4 pt-[15%] pb-2">
          <div class="space-y-1 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 640 512" aria-hidden="true">
              <path
                d="M512 192C512 86 426 0 320 0C263.8 0 213.3 24.1 178.2 62.5l25.2 19.9C232.6 51.4 274 32 320 32c88.4 0 160 71.6 160 160c0 15.6-5.4 37-16.6 63.4c-3.3 7.7-6.9 15.6-10.9 23.7l25.6 20.2C498.3 259.8 512 221.9 512 192zM176.6 255.4c-6.7-15.9-11.4-30-14-42.2L128.1 186c-.1 2-.1 4-.1 6c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0c17.3-21.6 42-53.6 67.2-89.8l-25.2-19.9c-24.4 35.2-48.5 66.5-65.8 88.1c-25.4-31.8-65.8-84.7-99.9-140c-17.3-28.1-32.7-56.3-43.6-82.1zM25.9 3.4C19-2 8.9-.8 3.4 6.1S-.8 23.1 6.1 28.6l608 480c6.9 5.5 17 4.3 22.5-2.6s4.3-17-2.6-22.5L25.9 3.4z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <p class="text-xs text-gray-500">No Map Found</p>
          </div>
        </div>

        {/* Content grid */}
        <div class="grid grid-cols-12 gap-3 text-sm">
          {/* Address */}
          <div class="col-span-6 sm:col-span-6">
            <dt class="my-2 font-medium text-gray-900">Delivery Site Address</dt>
            <dd class="flex flex-col text-gray-700">
              <span>{props.deliverySite?.address}</span>
              {props.deliverySite?.address2 && <span>{props.deliverySite?.address2}</span>}
              <span>
                {props.deliverySite?.city},{" "}
                {props.deliverySite?.province?.provinceShortName ?? props.deliverySite?.state}
              </span>
              <span>{props.deliverySite?.postalCode}</span>
              <span>{props.deliverySite?.country}</span>
            </dd>
          </div>

          {/* Features */}
          <div class="col-span-6 sm:col-span-6">
            <dt class="my-2 font-medium text-gray-900">Facility Features</dt>
            <dd class="flex flex-col text-gray-700">
              <For each={features()}>
                {(feat) => (
                  <span>
                    <svg
                      class="-mt-1 mr-1 inline-flex h-3 w-3 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                        class=""
                      />
                    </svg>
                    {feat}
                  </span>
                )}
              </For>
            </dd>
          </div>

          {/* Contact Information */}
          <div class="col-span-12 sm:col-span-12">
            <dt class="my-2 font-medium text-gray-900">Contact Information</dt>
            <dd class="grid grid-cols-12 gap-3">
              <For each={props.deliverySite?.contacts}>
                {(contact) => (
                  <p class="col-span-6 flex flex-col text-gray-700">
                    <Show when={contact.primaryFlag === "Y"}>
                      <span class="mb-0.5 rounded-md text-xs font-medium text-gray-500">Primary Contact:</span>
                    </Show>
                    <span>{`${contact.firstName} ${contact.lastName}`}</span>
                    <span>
                      {contact.phoneNumber} {contact.extension && <span>Ext. {contact.extension}</span>}
                    </span>
                    <a href={`mailto:${contact.emailAddress}`} class="text-xs text-sky-600 hover:text-sky-800">
                      {contact.emailAddress}
                    </a>
                  </p>
                )}
              </For>
            </dd>
          </div>

          {/* Shipping Instructions */}
          <div class="col-span-12 sm:col-span-12">
            <dt class="my-2 font-medium text-gray-900">Shipping Instructions</dt>
            <dd class="text-sm whitespace-pre-wrap text-gray-700">{props.deliverySite?.deliveryInstructions}</dd>
          </div>

          {/* Attached Files */}
          <div class="col-span-12 sm:col-span-12">
            <DeliverySiteAttachmentsFiles
              title="Attachment files"
              attachments={props.deliverySite?.attachments}
              deliverySiteId={props.deliverySite?.deliverySiteId}
            />
          </div>
        </div>
      </div>
    </Show>
  );
};
