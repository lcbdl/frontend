import { DeliverySiteStatus } from "@/components/delivery-sites/DeliverySiteStatus";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/DataTable";
import { MockDeliverySite, fetchAllTableData } from "@/utils/MockDataServer";
import { ColumnDef, createColumnHelper } from "@tanstack/solid-table";
import { createSignal, onMount } from "solid-js";

const columnHelper = createColumnHelper<MockDeliverySite>();

const columns: ColumnDef<MockDeliverySite, any>[] = [
  columnHelper.accessor("name", {
    header: "Location name",
    cell: (info) => (
      <div class="flex flex-col">
        <div class="font-semibold">{info.getValue()}</div>
        <div class="text-sm text-gray-500">{info.row.original.address}</div>
        <div class="text-sm text-gray-500">Site No. {info.row.original.siteNumber}</div>
      </div>
    ),
  }),
  columnHelper.accessor("address", {
    header: "Address",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("province", {
    header: "Province",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("postalCode", {
    header: "Postal Code",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("siteNumber", {
    header: "Site Number",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <DeliverySiteStatus status={info.getValue()} />,
    // @ts-expect-error custom filter function name
    filterFn: "customMultipleSelectionFn",
    meta: {
      filterOptions: ["active", "offline"],
    },
  }),
  columnHelper.accessor("city", {
    header: "City",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("price", {
    header: "Price",
    cell: (info) => `$${info.getValue()}`,
    // @ts-expect-error custom filter function name
    filterFn: "customNumberRangeFn",
    meta: {
      filterOptions: [
        { id: "lt300", label: "Under $300", max: 300 },
        { id: "btw300-500", label: "$300 - $500", min: 300, max: 500 },
        { id: "gt500", label: "Over $500", min: 500 },
        { id: "lt300", label: "Under $300", max: 300 },
        { id: "btw300-500", label: "$300 - $500", min: 300, max: 500 },
        { id: "gt500", label: "Over $500", min: 500 },
        { id: "lt300", label: "Under $300", max: 300 },
        { id: "btw300-500", label: "$300 - $500", min: 300, max: 500 },
        { id: "gt500", label: "Over $500", min: 500 },
      ],
    },
  }),
  columnHelper.accessor("feature", {
    header: "Feature",
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <div class="flex flex-row gap-1">
        <Button
          variant="outlined"
          size="sm"
          class="hover:bg-gray-700 hover:text-white hover:shadow-gray-800/10 hover:ring-gray-900"
          onClick={() => alert(`View ${info.row.original.id} ${info.row.original.id}`)}
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
          View<span class="sr-only">, Delivery Site</span>
        </Button>
        <Button
          variant="outlined"
          size="sm"
          class="hover:bg-gray-700 hover:text-white hover:shadow-gray-800/10 hover:ring-gray-900"
          onClick={() => alert(`Delete ${info.row.original.id} ${info.row.original.id}`)}
        >
          <svg
            aria-hidden="true"
            class="mr-2 h-4 w-4"
            fill="currentColor"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z"
              fill-rule="evenodd"
            />
          </svg>
          Edit<span class="sr-only">, Delivery Site</span>
        </Button>
      </div>
    ),
  }),
];

const columnsVisibility = {
  name: true,
  address: false,
  province: false,
  postalCode: false,
  siteNumber: false,
  status: true,
  city: true,
  feature: true,
  actions: true,
};

export const ClientSideDataTable = () => {
  const [data, setData] = createSignal<MockDeliverySite[]>([]);
  onMount(async () => {
    const { rows } = await fetchAllTableData();
    setData(rows);
  });

  return (
    <div class="my-3 flex flex-col gap-4 rounded-lg border-1 border-solid border-gray-500 p-5 shadow-lg shadow-gray-500/25">
      <DataTable<MockDeliverySite>
        columns={columns}
        data={data()}
        columnVisibility={columnsVisibility}
        enableSorting={true}
        enableFilters={true}
        enableColumnFilters={true}
        enableGlobalFilter={true}
        sort={[{ id: "name", desc: true }]}
        enablePagination={true}
        pageSize={5}
      />
    </div>
  );
};
