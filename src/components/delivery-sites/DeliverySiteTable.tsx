import { DeliverySiteStatus } from "@/components/delivery-sites/DeliverySiteStatus";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/DataTable";
import { useDeliverySiteQuery } from "@/hooks/useDeliverySiteQuery";
import i18n from "@/i18n";
import { DeliverySite } from "@/types/DeliverySite";
import { useNavigate } from "@solidjs/router";
import { useQuery } from "@tanstack/solid-query";
import { ColumnDef, createColumnHelper } from "@tanstack/solid-table";
import { createMemo, Match, Switch } from "solid-js";
import Loading from "../ui/loading";
import { ShowError } from "../ui/ShowError";
import { DeliverySiteFeature } from "./DeliverySiteFeature";
import { ViewDeliverySite } from "./ViewDeliverySite";

const isTestEnv = import.meta.env?.MODE === "test";

export const DeliverySiteTable = () => {
  const { findDeliverySites, findCityNames, findDeliverySiteNames, findAllStatus } = useDeliverySiteQuery();

  const findAllStatusQuery = useQuery(() => ({
    queryKey: ["deliverySiteStatus"],
    queryFn: findAllStatus,
    retry: isTestEnv ? false : 3,
  }));

  const columnHelper = createColumnHelper<DeliverySite>();

  const columns = createMemo<ColumnDef<DeliverySite, any>[]>(() => [
    columnHelper.accessor("deliverySiteName", {
      header: i18n.t("deliverySite.fields.locationName.label"),
      cell: (info) => (
        <div class="flex min-w-48 flex-col">
          <div class="text-sm leading-4 font-medium text-gray-900">{info.getValue()}</div>
          <div class="mt-0.5 text-xs font-medium text-gray-500">{info.row.original.address}</div>
          {info.row.original.address2 && (
            <div class="mt-0.5 text-xs font-medium text-gray-500">{info.row.original.address2}</div>
          )}
          {info.row.original.siteNumber && (
            <div class="pt-0.5 text-xs text-gray-500">Site No. {info.row.original.siteNumber}</div>
          )}
        </div>
      ),
      // @ts-expect-error custom filter function name
      filterFn: "customAutoSuggestionFn",
      meta: {
        fetchFn: findDeliverySiteNames,
        placeholder: i18n.t("dataTable.searchFor", { columnId: i18n.t("deliverySite.fields.locationName.label") }),
      },
    }),
    columnHelper.accessor("address", {
      header: i18n.t("deliverySite.fields.address.label"),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("province", {
      header: i18n.t("deliverySite.fields.province.label"),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("postalCode", {
      header: i18n.t("deliverySite.fields.postalCode.label"),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("delFacilityNumber", {
      header: i18n.t("deliverySite.fields.delFacilityNumber.label"),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: i18n.t("deliverySite.fields.status.label"),
      cell: (info) => <DeliverySiteStatus status={info.getValue()} />,
      // @ts-expect-error custom filter function name
      filterFn: "customMultipleSelectionFn",
      meta: {
        filterOptions: findAllStatusQuery.isFetched
          ? (findAllStatusQuery.data ?? []).map((item) => ({
              value: item,
              label: i18n.t(`deliverySite.status.${item}`),
            }))
          : [],
      },
    }),
    columnHelper.accessor("city", {
      header: i18n.t("deliverySite.fields.city.label"),
      cell: (info) => info.getValue(),
      // @ts-expect-error custom filter function
      filterFn: "customAutoSuggestionFn",
      meta: {
        fetchFn: findCityNames,
        placeholder: i18n.t("dataTable.searchFor", { columnId: i18n.t("deliverySite.fields.city.label") }),
      },
    }),
    columnHelper.display({
      id: "feature",
      header: i18n.t("deliverySite.fields.feature.label"),
      cell: (info) => <DeliverySiteFeature deliverySite={info.row.original} />,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span class="sr-only">i18n.t("deliverySite.fields.actions.label")</span>,
      cell: (info) => {
        const navigate = useNavigate();
        return (
          <div class="flex flex-row gap-2">
            <ViewDeliverySite deliverySiteId={info.row.original.deliverySiteId!} />
            <Button
              variant="outlined"
              size="sm"
              class="hover:bg-gray-700 hover:text-white hover:shadow-gray-800/10 hover:ring-gray-900"
              onClick={() => navigate(`edit?id=${info.row.original.deliverySiteId}`)}
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
        );
      },
    }),
  ]);

  const columnsVisibility = {
    deliverySiteName: true,
    address: false,
    province: false,
    postalCode: false,
    delFacilityNumber: false,
    siteNumber: false,
    status: true,
    city: true,
    feature: true,
    actions: true,
  };

  const query = useQuery(() => ({
    queryKey: ["deliverySites"],
    queryFn: findDeliverySites,
    retry: isTestEnv ? false : 3,
  }));

  return (
    <Switch>
      <Match when={query.isLoading}>
        <Loading />
      </Match>
      <Match when={query.isError}>
        <ShowError class="text-lg" error={query.error?.message} />
      </Match>
      <Match when={query.isSuccess}>
        <div class="pb-6">
          <DataTable<DeliverySite>
            columns={columns()}
            data={query.data ?? []}
            columnVisibility={columnsVisibility}
            enableSorting={true}
            enableFilters={true}
            enableColumnFilters={true}
            enableGlobalFilter={true}
            sort={[{ id: "city", desc: true }]}
            enablePagination={true}
            pageSize={5}
          />
        </div>
      </Match>
    </Switch>
  );
};
