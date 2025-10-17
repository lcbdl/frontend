import { useUnsavedChangesContext } from "@/context/UnsavedChangesContext";
import i18n from "@/i18n";
import { cn } from "@/utils/cls-util";
import { useLocation } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Accordion, AccordionItem } from "../ui/Accordion";

const isDevEnv = import.meta.env?.DEV;
const baseUrl = isDevEnv ? "/" : "/app/requests-manager";

const navItems = [
  {
    label: i18n.t("sideNavBar.emergencyAssistanceLabel"),
    path: "/viewEmergencies",
    svgPath:
      "M352 32c17.7 0 32 14.3 32 32l0 320-133.5 0c-13.2-37.3-48.7-64-90.5-64s-77.4 26.7-90.5 64L64 384c-17.7 0-32-14.3-32-32L32 64c0-17.7 14.3-32 32-32l288 0zM0 352c0 35.3 28.7 64 64 64c0 53 43 96 96 96s96-43 96-96l128 0c0 53 43 96 96 96s96-43 96-96l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-16 0 0-148.2c0-11.5-4.1-22.5-11.6-31.2l-78.7-91.8C508.6 102.1 495.3 96 481.3 96L416 96l0-32c0-35.3-28.7-64-64-64L64 0C28.7 0 0 28.7 0 64L0 352zM416 128l65.3 0c4.7 0 9.1 2 12.1 5.6L570.9 224 416 224l0-96zm0 216.4l0-88.4 160 0 0 128-5.5 0c-13.2-37.3-48.7-64-90.5-64c-24.6 0-47 9.2-64 24.4zM160 352a64 64 0 1 1 0 128 64 64 0 1 1 0-128zm256 64a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM192 64c-17.7 0-32 14.3-32 32l0 32-32 0c-17.7 0-32 14.3-32 32l0 32c0 17.7 14.3 32 32 32l32 0 0 32c0 17.7 14.3 32 32 32l32 0c17.7 0 32-14.3 32-32l0-32 32 0c17.7 0 32-14.3 32-32l0-32c0-17.7-14.3-32-32-32l-32 0 0-32c0-17.7-14.3-32-32-32l-32 0zm0 32l32 0 0 48c0 8.8 7.2 16 16 16l48 0 0 32-48 0c-8.8 0-16 7.2-16 16l0 48-32 0 0-48c0-8.8-7.2-16-16-16l-48 0 0-32 48 0c4.2 0 8.3-1.7 11.3-4.7s4.7-7.1 4.7-11.3l0-48z",
    viewBox: "0 0 640 512",
    activeColor: "text-red-700",
    hoverColor: "group-hover:text-red-700",
    index: 0,
    notificationCount: 1,
    notificationColor: "border-red-700/30 bg-red-50 text-red-700",
    childItems: [
      {
        label: i18n.t("sideNavBar.viewEmergenciesLabel"),
        path: "/viewEmergencies2",
        svg: "",
        activeColor: "border-gray-700",
        index: 0,
      },
    ],
  },
  {
    label: i18n.t("sideNavBar.allocatedInventoryLabel"),
    path: "/allocatedInventory",
    svgPath:
      "M208 32l0 96c0 5.5 2.9 10.7 7.6 13.6s10.6 3.2 15.6 .7L288 113.9l56.8 28.4c5 2.5 10.9 2.2 15.6-.7s7.6-8.1 7.6-13.6l0-96 64 0c8.8 0 16 7.2 16 16l0 160c0 8.8-7.2 16-16 16l-288 0c-8.8 0-16-7.2-16-16l0-160c0-8.8 7.2-16 16-16l64 0zM224 0L144 0C117.5 0 96 21.5 96 48l0 160c0 26.5 21.5 48 48 48l288 0c26.5 0 48-21.5 48-48l0-160c0-26.5-21.5-48-48-48L352 0 224 0zm16 32l96 0 0 70.1L295.2 81.7c-4.5-2.3-9.8-2.3-14.3 0L240 102.1 240 32zM195.4 304c-15.8 0-31.2 4.7-44.4 13.4L75.2 368 16 368c-8.8 0-16 7.2-16 16s7.2 16 16 16l64 0 4.8 0 4-2.7 79.9-53.3c7.9-5.3 17.1-8.1 26.6-8.1L344 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-24 0-64 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l64 0 24 0 60.6 0c2.9 0 5.7-.8 8.2-2.3L511.3 355c3.4-2 7.2-3 11.1-3l1.3 0c11.2 0 20.3 9.1 20.3 20.3c0 6.9-3.5 13.3-9.2 17L415.1 467.1c-13 8.4-28.1 12.9-43.6 12.9L16 480c-8.8 0-16 7.2-16 16s7.2 16 16 16l355.5 0c21.7 0 42.9-6.3 61-18.1l119.6-77.8C567 406.5 576 390 576 372.3c0-28.9-23.4-52.3-52.3-52.3l-1.3 0c-9.7 0-19.1 2.6-27.5 7.6L400.2 384l-5.6 0c3.5-7.3 5.4-15.4 5.4-24c0-30.9-25.1-56-56-56l-148.6 0z",
    viewBox: "0 0 576 512",
    activeColor: "text-yellow-700",
    hoverColor: "group-hover:text-yellow-700",
    index: 1,
    notificationCount: 0,
    notificationColor: "",
    childItems: [
      {
        label: i18n.t("sideNavBar.inventoryLabel"),
        path: "/allocatedInventoryNew",
        svg: "",
        activeColor: "border-gray-700",
        index: 0,
      },
    ],
  },
  {
    label: i18n.t("sideNavBar.loanedAssetsLabel"),
    path: "/loanedAssets",
    svgPath:
      "M352 222.7c0 18.4 14.9 33.3 33.3 33.3c8.4 0 16.4-3.1 22.6-8.8l99-91.4c3.3-3 5.1-7.3 5.1-11.8s-1.9-8.7-5.1-11.8l-99-91.4c-6.1-5.7-14.2-8.8-22.6-8.8C366.9 32 352 46.9 352 65.3l0 62.7L16 128c-8.8 0-16 7.2-16 16s7.2 16 16 16l336 0 0 62.7zm33.3 1.3c-.7 0-1.3-.6-1.3-1.3l0-157.5c0-.7 .6-1.3 1.3-1.3c.3 0 .6 .1 .9 .3L472.4 144l-86.3 79.7c-.2 .2-.5 .3-.9 .3zM126.7 480c18.4 0 33.3-14.9 33.3-33.3l0-62.7 336 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-336 0 0-62.7c0-18.4-14.9-33.3-33.3-33.3c-8.4 0-16.4 3.1-22.6 8.8l-99 91.4C1.9 359.3 0 363.5 0 368s1.9 8.7 5.1 11.8l99 91.4c6.1 5.7 14.2 8.8 22.6 8.8zm1.3-33.3c0 .7-.6 1.3-1.3 1.3c-.3 0-.6-.1-.9-.3L39.6 368l86.3-79.7c.2-.2 .5-.3 .9-.3c.7 0 1.3 .6 1.3 1.3l0 157.5z",
    viewBox: "0 0 512 512",
    activeColor: "text-green-700",
    hoverColor: "group-hover:text-green-700",
    index: 2,
    notificationCount: 14,
    notificationColor: "border-gray-300 bg-white inset-shadow-gray-200",
    childItems: [
      {
        label: i18n.t("sideNavBar.assetsLabel"),
        path: "/loanedAssetsNew",
        svg: "",
        activeColor: "border-gray-700",
        index: 0,
      },
    ],
  },
  {
    label: i18n.t("sideNavBar.informationAndDataLabel"),
    path: "/informationAndData",
    svgPath:
      "M320 32L64 32C46.3 32 32 46.3 32 64l0 384c0 17.7 14.3 32 32 32l232.2 0c9.8 11.8 21 22.3 33.5 31.3c-3.2 .5-6.4 .7-9.7 .7L64 512c-35.3 0-64-28.7-64-64L0 64C0 28.7 28.7 0 64 0L320 0c35.3 0 64 28.7 64 64l0 134.6c-11.2 3.2-21.9 7.4-32 12.6L352 64c0-17.7-14.3-32-32-32zM64 144c0-8.8 7.2-16 16-16l224 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L80 160c-8.8 0-16-7.2-16-16zm16 80l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L80 256c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 96l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L80 352c-8.8 0-16-7.2-16-16s7.2-16 16-16zm464 48a112 112 0 1 0 -224 0 112 112 0 1 0 224 0zm-256 0a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-32a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm-32 96c0-8.8 7.2-16 16-16l0-32c-8.8 0-16-7.2-16-16s7.2-16 16-16l16 0c8.8 0 16 7.2 16 16l0 48s0 0 0 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-16 0-16 0c-8.8 0-16-7.2-16-16z",
    viewBox: "0 0 576 512",
    activeColor: "text-cyan-700",
    hoverColor: "group-hover:text-cyan-700",
    index: 3,
    notificationCount: 0,
    notificationColor: "",
    childItems: [],
  },
  {
    label: i18n.t("sideNavBar.surplusInventoryLabel"),
    path: "/surplusInventory",
    svgPath:
      "M384 32c17.7 0 32 14.3 32 32l0 128 32 0 0-128c0-35.3-28.7-64-64-64L320 0 256 0 192 0c-35.3 0-64 28.7-64 64l0 128 32 0 0-128c0-17.7 14.3-32 32-32l32 0 0 56c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-56 32 0zM256 32l64 0 0 56c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-56zm71.6 480L512 512c35.3 0 64-28.7 64-64l0-160c0-35.3-28.7-64-64-64l-64 0-64 0-56.4 0c8.3 9.2 14.8 20.1 19 32l5.5 0 0 31.9c0 0 0 0 0 .1l0 24c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-56 32 0c17.7 0 32 14.3 32 32l0 160c0 17.7-14.3 32-32 32l-165.5 0c-4.2 11.9-10.7 22.8-19 32zM384 256l64 0 0 56c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-56zm-128 0c17.7 0 32 14.3 32 32l0 160c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-160c0-17.7 14.3-32 32-32l32 0 0 56c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-56 32 0zM128 312l0-56 64 0 0 56c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm128-88l-32 0-32 0-64 0-32 0-32 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-160c0-35.3-28.7-64-64-64z",
    viewBox: "0 0 576 512",
    activeColor: "text-violet-700",
    hoverColor: "group-hover:text-violet-700",
    index: 4,
    notificationCount: 0,
    notificationColor: "",
    childItems: [],
  },
  {
    label: i18n.t("sideNavBar.deliverySiteManagerLabel"),
    path: "",
    svgPath:
      "M366.6 155c6.7-15.9 9.4-27.6 9.4-35c0-48.6-39.4-88-88-88s-88 39.4-88 88c0 7.4 2.7 19 9.4 35c6.5 15.4 15.7 32.4 26.4 49.7c17.1 27.8 36.9 54.7 52.2 74.4c15.3-19.7 35.1-46.6 52.2-74.4c10.7-17.3 19.9-34.3 26.4-49.7zM302.8 312c-7.7 9.6-22 9.6-29.6 0C241.1 271.9 168 174.6 168 120C168 53.7 221.7 0 288 0s120 53.7 120 120c0 54.6-73.1 151.9-105.2 192zm103.1-89.1c-.8 .3-1.7 .6-2.5 .8c8.2-14.2 15.7-28.7 21.8-42.9l117.9-47.2c15.8-6.3 32.9 5.3 32.9 22.3l0 270.8c0 9.8-6 18.6-15.1 22.3l-155 62c-3.3 1.3-6.9 1.5-10.3 .5L176.9 448.9l-144 57.6C17.1 512.8 0 501.2 0 484.2L0 213.4c0-9.8 6-18.6 15.1-22.3l123.2-49.3c2.1 10.4 5.4 20.8 9.2 30.8L32 218.8l0 253.5 128-51.2L160 304c0-8.8 7.2-16 16-16s16 7.2 16 16l0 115.9 192 54.9L384 304c0-8.8 7.2-16 16-16s16 7.2 16 16l0 168.4 128-51.2 0-253.5L405.9 222.9zM288 88a24 24 0 1 1 0 48 24 24 0 1 1 0-48z",
    viewBox: "0 0 576 512",
    activeColor: "text-sky-700",
    hoverColor: "group-hover:text-sky-700",
    index: 5,
    childItems: [
      {
        label: i18n.t("sideNavBar.viewAllDeliverySitesLabel"),
        path: "/delivery-site",
        svgPath: "",
        activeColor: "border-gray-700",
        index: 0,
      },
      {
        label: i18n.t("sideNavBar.createNewDeliverySiteLabel"),
        path: "/delivery-site/edit",
        svgPath: "",
        activeColor: "border-gray-700",
        index: 1,
      },
    ],
  },
  {
    label: i18n.t("sideNavBar.stopShipmentManagerLabel"),
    path: "/new",
    viewBox: "0 0 576 512",
    svgPath:
      "M240 64l102.4 0c12.6 0 24.1 7.4 29.2 19l34.2 77L240 160l0-96zm0 128l112 0 64 0 16 0 16 0 0-2.4c0-9-1.9-17.8-5.5-26L400.9 70c-10.3-23.1-33.2-38-58.5-38L105.6 32C80.3 32 57.4 46.9 47.1 70L5.5 163.6c-3.6 8.2-5.5 17-5.5 26L0 416c0 35.3 28.7 64 64 64l232.2 0c-8.1-9.8-15.2-20.6-21-32L64 448c-17.7 0-32-14.3-32-32l0-224 176 0 32 0zm-32-32L42.1 160 76.3 83c5.1-11.6 16.6-19 29.2-19L208 64l0 96zm224 96a112 112 0 1 1 0 224 112 112 0 1 1 0-224zm0 256a144 144 0 1 0 0-288 144 144 0 1 0 0 288zm67.3-187.3c-6.2-6.2-16.4-6.2-22.6 0L416 385.4l-28.7-28.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l40 40c6.2 6.2 16.4 6.2 22.6 0l72-72c6.2-6.2 6.2-16.4 0-22.6z",
    activeColor: "text-amber-700",
    hoverColor: "group-hover:text-amber-700",
    index: 6,
    notificationCount: 0,
    notificationColor: "",
    childItems: [],
  },
];

const demoRoutes = [
  {
    path: "/components",
    label: i18n.t("sideNavBar.componentsDemoLabel"),
    activeColor: "text-blue-700",
    hoverColor: "group-hover:text-blue-700",
    notificationCount: 0,
    notificationColor: "border-red-700/30 bg-red-50 text-red-700",
  },
  {
    path: "/form-fields",
    label: i18n.t("sideNavBar.formFieldsDemoLabel"),
    activeColor: "text-blue-700",
    hoverColor: "group-hover:text-blue-700",
    notificationCount: 0,
    notificationColor: "",
  },
];

export const SideNavBar = () => {
  const location = useLocation();
  const { safeNavigate } = useUnsavedChangesContext();

  return (
    <nav class="flex flex-col">
      <ul role="list" class="flex flex-1 flex-col px-4 py-5">
        <For each={navItems}>
          {(item) => (
            <>
              {/* Divider appears when index is 5 */}
              <Show when={item.index === 5}>
                <div class="-mx-5 mt-5 border-t border-t-gray-200 pt-5" />
              </Show>

              {item.childItems && item.childItems.length > 0 ? (
                <li>
                  <Accordion isMulti={false} backgroundColour="bg-gray-100">
                    <AccordionItem
                      index={item.index}
                      title={
                        (
                          <span class="flex items-center gap-x-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class={cn(
                                "h-6 w-6 shrink-0",
                                item.hoverColor,
                                item.childItems?.some(
                                  (child) =>
                                    location.pathname === (import.meta.env.DEV ? child.path : baseUrl + child.path),
                                )
                                  ? item.activeColor
                                  : "text-gray-400",
                              )}
                              fill="currentColor"
                              viewBox={item.viewBox}
                              aria-hidden="true"
                              data-slot="icon"
                            >
                              <path d={item.svgPath} />
                            </svg>
                            <span class="leading-4">{item.label}</span>
                            <Show when={item.notificationCount != undefined && item.notificationCount > 0}>
                              <div
                                class={cn(
                                  "gap-3 rounded-full border px-1.5 py-0.5 text-xs inset-shadow-sm inset-shadow-gray-200",
                                  item.notificationColor,
                                )}
                              >
                                {item.notificationCount}
                              </div>
                            </Show>
                          </span>
                        ) as unknown as string
                      }
                      buttonClass="flex w-full items-center gap-x-3 rounded-md p-2 text-sm/6 font-bold text-gray-700 hover:bg-white "
                      contentClass="inset-shadow-none bg-gray-100"
                      chevronClass="ml-auto"
                      chevronRight={true}
                    >
                      <ul>
                        <For each={item.childItems}>
                          {(child) => (
                            <li>
                              <button
                                role="link"
                                onClick={() => safeNavigate(child.path)}
                                class={cn(
                                  "border-gray-700py-0.5 ml-3 block border-l pr-2 pl-6 text-sm/6 text-gray-700 hover:bg-gray-50",
                                  location.pathname === (import.meta.env.DEV ? child.path : baseUrl + child.path)
                                    ? "border-gray-700"
                                    : "border-gray-300",
                                )}
                              >
                                {child.label}
                              </button>
                            </li>
                          )}
                        </For>
                      </ul>
                    </AccordionItem>
                  </Accordion>
                </li>
              ) : (
                <li>
                  <button
                    role="link"
                    onClick={() => safeNavigate(item.path)}
                    class="group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-bold text-gray-700 hover:bg-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class={cn(
                        "h-6 w-6 shrink-0",
                        item.hoverColor,
                        location.pathname === (import.meta.env.DEV ? item.path : baseUrl + item.path)
                          ? item.activeColor
                          : "text-gray-400",
                      )}
                      fill="currentColor"
                      viewBox="0 0 576 512"
                      aria-hidden="true"
                      data-slot="icon"
                    >
                      <path d={item.svgPath} />
                    </svg>
                    <span class="leading-4">{item.label}</span>
                    <Show when={item.notificationCount != undefined && item.notificationCount > 0}>
                      <div
                        class={cn(
                          "gap-3 rounded-full border px-1.5 py-0.5 text-xs inset-shadow-sm inset-shadow-gray-200",
                          item.notificationColor,
                        )}
                      >
                        {item.notificationCount}
                      </div>
                    </Show>
                  </button>
                </li>
              )}
            </>
          )}
        </For>
        <For each={demoRoutes}>
          {(item) => (
            <li>
              <button
                role="link"
                onClick={() => safeNavigate(item.path)}
                class="group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-bold text-gray-700 hover:bg-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class={cn(
                    "h-6 w-6 shrink-0",
                    item.hoverColor,
                    location.pathname === (import.meta.env.DEV ? item.path : baseUrl + item.path)
                      ? item.activeColor
                      : "text-gray-400",
                  )}
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  viewBox="0 0 576 512"
                >
                  <path d="M240 64l102.4 0c12.6 0 24.1 7.4 29.2 19l34.2 77L240 160l0-96zm0 128l112 0 64 0 16 0 16 0 0-2.4c0-9-1.9-17.8-5.5-26L400.9 70c-10.3-23.1-33.2-38-58.5-38L105.6 32C80.3 32 57.4 46.9 47.1 70L5.5 163.6c-3.6 8.2-5.5 17-5.5 26L0 416c0 35.3 28.7 64 64 64l232.2 0c-8.1-9.8-15.2-20.6-21-32L64 448c-17.7 0-32-14.3-32-32l0-224 176 0 32 0zm-32-32L42.1 160 76.3 83c5.1-11.6 16.6-19 29.2-19L208 64l0 96zm224 96a112 112 0 1 1 0 224 112 112 0 1 1 0-224zm0 256a144 144 0 1 0 0-288 144 144 0 1 0 0 288zm67.3-187.3c-6.2-6.2-16.4-6.2-22.6 0L416 385.4l-28.7-28.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l40 40c6.2 6.2 16.4 6.2 22.6 0l72-72c6.2-6.2 6.2-16.4 0-22.6z" />
                </svg>
                <span class="leading-4">{item.label}</span>
                <Show when={item.notificationCount != undefined && item.notificationCount > 0}>
                  <div
                    class={cn(
                      "gap-3 rounded-full border px-1.5 py-0.5 text-xs inset-shadow-sm inset-shadow-gray-200",
                      item.notificationColor,
                    )}
                  >
                    {item.notificationCount}
                  </div>
                </Show>
              </button>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
};
