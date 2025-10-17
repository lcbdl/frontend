import i18n from "@/i18n";
import { Show } from "solid-js";

type TableDataInfoProps = {
  startIndex: () => number;
  endIndex: () => number;
  totalRowsCount: () => number;
};

export const TableDataInfo = (props: TableDataInfoProps) => {
  return (
    <p class="text-sm text-gray-600" role="status" aria-live="polite">
      <Show when={props.totalRowsCount() > 1}>
        {i18n.t("dataTable.showingEntries", {
          from: props.startIndex(),
          to: props.endIndex(),
          total: props.totalRowsCount(),
        })}
      </Show>
      <Show when={props.totalRowsCount() === 1}>{i18n.t("dataTable.showingOneEntry")}</Show>
      <Show when={props.totalRowsCount() === 0}>{i18n.t("dataTable.noEntriesFound")}</Show>
    </p>
  );
};
