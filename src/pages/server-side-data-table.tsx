import { DataTable } from "@/components/ui/table/DataTable";
import { fetchTableData, MockDeliverySite } from "@/utils/MockDataServer";
import { ColumnDef, createColumnHelper } from "@tanstack/solid-table";

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
    cell: (info) => info.getValue(),
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
      <button onClick={() => alert(`Editing ${info.row.original.id} ${info.row.original.id}`)}>Edit</button>
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
export const ServerSideDataTable = () => {
  return (
    <div class="my-3 flex flex-col gap-4 rounded-lg border-1 border-solid border-gray-500 p-5 shadow-lg shadow-gray-500/25">
      <DataTable<MockDeliverySite>
        columns={columns}
        fetchFn={fetchTableData}
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
