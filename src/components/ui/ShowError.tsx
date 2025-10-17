import { cn } from "@/utils/cls-util";
import { ComponentProps, createUniqueId, splitProps } from "solid-js";

type ShowErrorProps = ComponentProps<"span"> & { errorId?: string; error?: string };

export const ShowError = (props: ShowErrorProps) => {
  const [local, rest] = splitProps(props, ["class", "errorId", "error"]);
  return (
    <span
      id={local.errorId || createUniqueId()}
      class={cn("mt-1.5 text-xs text-red-500 italic", local.class)}
      {...rest}
    >
      {local.error}
    </span>
  );
};
