import { DeliverySiteStatusType } from "@/types/DeliverySite";
import { cn } from "@/utils/cls-util";
import { createMemo } from "solid-js";

type DeliverySiteStatusProps = {
  status?: DeliverySiteStatusType;
};

const statusStyles: Record<DeliverySiteStatusType, string> = {
  A: "px-3 py-0.5 font-medium text-green-900  bg-green-500/10 rounded-md",
  I: "px-3 py-0.5 font-medium text-red-900 bg-red-500/10 rounded-md",
  U: "px-3 py-0.5 font-medium text-gray-900 bg-gray-500/10 rounded-md",
  C: "px-3 py-0.5 font-medium text-black bg-yellow-300 border-2 border-black rounded-md",
};

const map = {
  A: "Active",
  I: "Inactive",
  U: "Unknown",
  C: "Classified",
};

export const DeliverySiteStatus = (props: DeliverySiteStatusProps) => {
  const status = createMemo(() => props.status ?? "U");
  return (
    <span class={cn("inline-block rounded-md px-2.5 py-1 text-sm font-medium", statusStyles[status()])}>
      {map[status()]}
    </span>
  );
};
