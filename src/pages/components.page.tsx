import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/button.tsx";
import { Calendar, CalendarEvent } from "@/components/ui/calendar.tsx";
import { DateInput } from "@/components/ui/date-time/date-input";
import { DatePicker } from "@/components/ui/date-time/date-picker";
import { TimeInput } from "@/components/ui/date-time/time-input";
import { TimePicker } from "@/components/ui/date-time/time-picker";
import { DropdownMenu, MenuItemType } from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useSnackbar } from "@/components/ui/snackbar";
import { ApiProvider } from "@/context/api-context";
import { QueryProvider } from "@/context/query-provider";

import { FileUpload } from "@/components/FileUpload";
import dayjs from "dayjs";
import { Globe } from "lucide-solid";
import { Component, createSignal, For } from "solid-js";
import { AutoSuggestDemo } from "./AutoSuggestInputDemo";
import { ClientSideDataTable } from "./client-side-data-table";
import { PaginationDemo } from "./PaginationDemo";
import { ServerSideDataTable } from "./server-side-data-table";

/**
 * This is used for developer local testing purpose.
 */
export const ComponentsPage: Component = () => {
  // Sample events for the calendar
  const events: CalendarEvent[] = [
    {
      eventId: 1,
      title: "Event 1",
      location: "Location 1",
      organizer: "Organizer 1",
      description: "Description 1",
      start: "2025-04-10T00:00:00+0000",
      end: "2025-04-15T00:23:45+0000",
      requestor: { requestorId: "0" },
    },
    {
      eventId: 2,
      title: "Event 2",
      location: "Location 2",
      organizer: "Organizer 2",
      description: "Description 2",
      start: "2025-04-13T00:00:00+0000",
      end: "2025-04-18T00:23:45+0000",
      requestor: { requestorId: "1" },
    },
    {
      eventId: 3,
      title: "Event 3",
      location: "Location 3",
      organizer: "Organizer 3",
      description: "Description 3",
      start: "2025-04-15T10:00:00+0000",
      end: "2025-04-15T14:23:45+0000",
      requestor: { requestorId: "2" },
    },
  ];

  const [dateValue, setDateValue] = createSignal("05/15/2023");
  const [timeValue, setTimeValue] = createSignal("01:11");
  const [sliderValue1, setSliderValue1] = createSignal(50);
  const [sliderValue2, setSliderValue2] = createSignal(30);
  const [sliderValue3, setSliderValue3] = createSignal(70);
  const [open1, setOpen1] = createSignal(false);
  const [open2, setOpen2] = createSignal(false);
  const [open3, setOpen3] = createSignal(false);
  const [open4, setOpen4] = createSignal(false);
  const [open5, setOpen5] = createSignal(false);

  const handleAccept = () => {
    console.log("Accepted!");
    setOpen1(false);
  };

  const handleCancel = () => {
    console.log("Cancelled.");
    setOpen1(false);
  };

  const menuItems: MenuItemType[] = [
    { label: "Game", href: "/game" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      <div class="w-full p-5">
        <h1>FileUploader Component</h1>
        <div class="flex w-full gap-2">
          <div class="w-full">
            <FileUpload title="File Upload" subtitle="Upload any file pertaining to this request for assistance." />
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1>AutoSuggestInput</h1>
        <div class="flex w-full gap-2">
          <div class="w-full">
            <h2>Normal</h2>
            <AutoSuggestDemo />
          </div>
          <div class="w-full">
            <h2>With initial value</h2>
            <AutoSuggestDemo value="Toronto" />
          </div>
          <div class="w-full">
            <h2>Disabled</h2>
            <AutoSuggestDemo disabled={true} />
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1>Calendar</h1>
        <div class="grid w-full grid-cols-1 gap-6">
          <div class="w-full">
            <Calendar events={events} />
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1>Dropdown Menu</h1>
        <div class="flex w-full gap-2">
          <div class="w-full">
            <DropdownMenu
              trigger={
                <>
                  <Globe size={14} class="mr-2" />
                  <span>English</span>
                </>
              }
            >
              <ul>
                <For each={menuItems}>
                  {(item) => (
                    <li class="my-3">
                      <a
                        href={item.href}
                        class="cursor-pointer font-semibold select-none hover:text-blue-500 hover:underline"
                      >
                        {item.label}
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </DropdownMenu>
          </div>
          <div class="w-full">
            <DropdownMenu trigger="Menu">
              <div>Menu Content</div>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1>Slider</h1>
        <div class="flex w-full gap-2">
          <div class="w-full">
            <h2>Normal</h2>
            <Slider
              min={50}
              max={500}
              step={10}
              onInput={(v) => {
                console.log("onInput", v);
                setSliderValue1(v);
              }}
              trackClass="bg-red-200"
              thumbClass="bg-red-600"
              processTrackClass="bg-red-500"
            />
            <div class="mt-2"> {`Value: ${sliderValue1()} 🚀`}</div>
          </div>
          <div class="w-full">
            <h2>With initial value</h2>
            <Slider
              value={sliderValue2()}
              onInput={(val) => console.log("onInput", val)}
              onChange={(val) => console.log("onChange", val)}
            />
            <Button onClick={() => setSliderValue2(50)}>Set slider value</Button>
          </div>
          <div class="w-full">
            <h2>Disabled</h2>
            <Slider
              disabled
              value={sliderValue3()}
              onInput={(val) => console.log("onInput", val)}
              onChange={(v) => setSliderValue3(v)}
            />
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1>Time Picker</h1>
        <div class="flex w-full gap-2">
          <div class="w-full">
            <h2>Normal</h2>
            <TimePicker onChange={(value) => console.log(value)} />
          </div>
          <div class="w-full">
            <h2>With initial value</h2>
            <TimePicker value={timeValue()} />
            <Button onClick={() => setTimeValue(dayjs().format("HH:mm"))}>Set to current time</Button>
          </div>
          <div class="w-full">
            <h2>Disabled</h2>
            <TimePicker disabled />
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1>Date Picker</h1>
        <div class="flex w-full gap-2">
          <div class="w-full">
            <h2>Normal</h2>
            <DatePicker onChange={(value) => console.log(value)} />
          </div>
          <div class="w-full">
            <h2>With initial value</h2>
            <DatePicker value={dateValue()} />
            <Button onClick={() => setDateValue(dayjs().format("MM/DD/YYYY"))}>Set to current date</Button>
          </div>
          <div class="w-full">
            <h2>Disabled</h2>
            <DatePicker disabled />
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1>Date Input</h1>
        <div class="flex w-full gap-2">
          <div class="w-full">
            <h2>Normal</h2>
            <DateInput />
          </div>
          <div class="w-full">
            <h2>With initial value</h2>
            <DateInput value="05/23/2005" />
          </div>
          <div class="w-full">
            <h2>Disabled</h2>
            <DateInput disabled />
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1>Time Input</h1>
        <div class="flex w-full gap-2">
          <div class="w-full">
            <h2>Normal</h2>
            <TimeInput />
          </div>
          <div class="w-full">
            <h2>With initial value</h2>
            <TimeInput value="23:05" />
          </div>
          <div class="w-full">
            <h2>Disabled</h2>
            <TimeInput disabled />
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1>Popover</h1>
        <div class="grid w-full grid-cols-1 gap-6">
          <div class="flex w-full gap-2">
            <Popover triggerTypes="click" title="Popover Title asdf asdfas asdfasf asdfasfd">
              <PopoverTrigger>
                <Button>Click me</Button>
              </PopoverTrigger>
              <PopoverContent>
                <p class="whitespace-break-spaces">
                  This is the popover content. sdfs sdfasdfasdfas asdfasdfasdf asdfasdf
                </p>
              </PopoverContent>
            </Popover>
            <Popover triggerTypes={["hover"]} title="Popover Title" showCloseButton={false}>
              <PopoverTrigger>
                <Button>Hover me</Button>
              </PopoverTrigger>
              <PopoverContent>
                <p class="whitespace-break-spaces">
                  This is the popover content. sdfs sdfasdfasdfas asdfasdfasdf asdfasdf
                </p>
              </PopoverContent>
            </Popover>
            <Popover triggerTypes={["focus"]} title="Popover Title" showCloseButton={false}>
              <PopoverTrigger>
                <Button>Tab to focus me</Button>
              </PopoverTrigger>
              <PopoverContent>
                <p class="whitespace-break-spaces">
                  This is the popover content. sdfs sdfasdfasdfas asdfasdfasdf asdfasdf
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1 class="mb-3">Button Component</h1>
        <div class="grid w-full grid-cols-1 gap-6">
          <div>
            <h2>Button - Variants</h2>
            <div class="my-3 grid items-center gap-4 rounded-lg border-1 border-solid border-gray-500 p-5 shadow-lg shadow-gray-500/25 sm:flex">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outlined" onClick={() => console.log("onClick")}>
                Outlined
              </Button>
              <Button variant="icon">
                <svg
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  class="m-0.5 h-3 w-3 text-white"
                >
                  <title>expand row</title>
                  <path
                    fill="currentColor"
                    d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"
                  />
                </svg>
              </Button>
            </div>
          </div>
          <div>
            <h2>Button - Disabled</h2>
            <div class="my-3 grid items-center gap-4 rounded-lg border-1 border-solid border-gray-500 p-5 shadow-lg shadow-gray-500/25 sm:flex">
              <Button variant="default" disabled>
                Default
              </Button>
              <Button variant="secondary" disabled>
                Secondary
              </Button>
              <Button variant="outlined" disabled>
                Outlined
              </Button>
              <Button variant="icon" disabled>
                <svg
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  class="m-0.5 h-3 w-3 text-white"
                >
                  <title>expand row</title>
                  <path
                    fill="currentColor"
                    d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1 class="mb-3">Accordion</h1>
        <div class="grid w-full grid-cols-1 gap-6">
          <div class="w-full">
            <Accordion
              isMulti={true}
              activeIndex={[0]}
              onChange={(indexes: number[]) => console.log("Accordion changed to index:", indexes)}
            >
              <AccordionItem index={0} title="Accordion Item 1">
                <div class="flex flex-col space-y-2">
                  <label>
                    <input type="checkbox" class="mr-2" />
                    Option 1
                  </label>
                  <label>
                    <input type="checkbox" class="mr-2" />
                    Option 2
                  </label>
                </div>
              </AccordionItem>
              <AccordionItem index={1} title="Accordion Item 2">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat.
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1 class="mb-3">Pagination demo</h1>
        <div class="grid w-full grid-cols-1 gap-6">
          <PaginationDemo />
        </div>
      </div>
      <div class="w-full p-5">
        <h1 class="mb-3">Client-side DataTable</h1>
        <div class="grid w-full grid-cols-1 gap-6">
          <ClientSideDataTable />
        </div>
      </div>
      <div class="w-full p-5">
        <h1 class="mb-3">Server-side DataTable</h1>
        <div class="grid w-full grid-cols-1 gap-6">
          <ApiProvider baseUrl="/api">
            <QueryProvider>
              <ServerSideDataTable />
            </QueryProvider>
          </ApiProvider>
        </div>
      </div>
      <div class="w-full p-5">
        <h1 class="mb-3">Snackbar</h1>
        <div class="grid w-full grid-cols-1 gap-6">
          <div>
            <h2>Button - Variants</h2>
            <Dump1 />
          </div>
        </div>
      </div>
      <div class="w-full p-5">
        <h1 class="mb-3">Modal Dialog</h1>
        <div class="grid w-full grid-cols-1 gap-6 sm:flex">
          <Button onClick={() => setOpen1(true)}>Open Empty Modal</Button>
          <Modal open={open1()} onClose={() => setOpen1(false)} showCloseButton={true} containerClass="justify-center">
            {/* blank entry  */}
            {<></>}
          </Modal>

          <Button onClick={() => setOpen2(true)}>Open Paragraph Modal</Button>
          <Modal
            title="This is a Title!"
            open={open2()}
            onClose={() => setOpen2(false)}
            showCloseButton={true}
            containerClass="justify-center"
          >
            {<p>Hello World :^)</p>}
          </Modal>

          <Button onClick={() => setOpen3(true)} class="btn">
            Open Confirmation
          </Button>
          <Modal
            open={open3()}
            onClose={() => setOpen3(false)}
            title="Confirm Action"
            containerClass="flex-col"
            actions={
              <>
                <Button onClick={handleAccept}>Accept</Button>
                <Button onClick={handleCancel} variant={"outlined"}>
                  Cancel
                </Button>
              </>
            }
          >
            Are you sure you want to perform this action?
            {/* Thumb with focus styles */}
          </Modal>
          <Button onClick={() => setOpen4(true)}>See Table</Button>
          <Modal
            title="Data Table Header"
            open={open4()}
            onClose={() => setOpen4(false)}
            showCloseButton={true}
            containerClass="justify-center"
          >
            <ClientSideDataTable />
          </Modal>
          <Button onClick={() => setOpen5(true)}>See Table w/o close</Button>
          <Modal
            open={open5()}
            onClose={() => setOpen5(false)}
            title="Data Table Header"
            showCloseButton={false}
            actions={<Button onClick={() => setOpen5(false)}>Close</Button>}
            containerClass="justify-center"
          >
            <ClientSideDataTable />
          </Modal>
        </div>
      </div>
    </>
  );
};
const Dump1 = () => {
  const snackbar = useSnackbar();
  return (
    <div class="my-3 grid items-center gap-4 rounded-lg border-1 border-solid border-gray-500 p-5 shadow-lg shadow-gray-500/25 sm:flex">
      <Button
        variant="default"
        onClick={() =>
          snackbar.open({
            message: "Hello world!",
            variant: "success",
            autoHideDuration: 5000,
          })
        }
      >
        Open Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          snackbar.open({
            message: "Hello world!",
            variant: "error",
            autoHideDuration: 5000,
          })
        }
      >
        Open Error
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          snackbar.open({
            message: "Hello world!",
            variant: "warning",
            autoHideDuration: 5000,
          })
        }
      >
        Open Warning
      </Button>
    </div>
  );
};
