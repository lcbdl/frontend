import { cn } from "@/utils/cls-util";
import { ChevronDown } from "lucide-solid";
import { Component, JSX, ParentComponent, createSignal } from "solid-js";

interface DropdownMenuProps {
  trigger: string | JSX.Element | (() => JSX.Element);
}

interface DropdownMenuContentProps {
  expanded: boolean;
}

export interface MenuItemType {
  label: string;
  href: string;
}

export const DropdownMenu: ParentComponent<DropdownMenuProps> = (props) => {
  const [expanded, setExpanded] = createSignal(false);

  const getTrigger = () => {
    const trigger = props.trigger;
    if (typeof trigger === "string") {
      return <span>{trigger}</span>;
    } else if (typeof trigger === "function") {
      return trigger();
    } else {
      return trigger;
    }
  };

  const handleMouseLeave = () => {
    setExpanded(false);
  };

  return (
    <div class="dropdown-menu relative inline-block" onMouseLeave={handleMouseLeave}>
      <DropdownMenuTrigger expanded={expanded()} setExpanded={setExpanded}>
        {getTrigger()}
      </DropdownMenuTrigger>
      <DropdownMenuContent expanded={expanded()}>{props.children}</DropdownMenuContent>
    </div>
  );
};

const DropdownMenuTrigger: Component<{
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  children: JSX.Element;
}> = (props) => {
  const handleClick = () => {
    props.setExpanded(!props.expanded);
  };

  return (
    <div onClick={handleClick} class="flex cursor-pointer items-end py-3 text-xs hover:text-blue-500 hover:underline">
      <span class="flex font-semibold select-none">{props.children}</span>
      <button aria-expanded={props.expanded} class="ml-1">
        <ChevronDown
          size={16}
          class={cn("cursor-pointer transition-transform duration-300", {
            "rotate-180": props.expanded,
          })}
        />
      </button>
    </div>
  );
};

const DropdownMenuContent: ParentComponent<DropdownMenuContentProps> = (props) => {
  return (
    <div
      class={cn(
        "absolute right-[-25px] z-40 block rounded-md border border-solid border-gray-400 bg-white p-4 text-sm whitespace-nowrap transition-all duration-500 before:absolute before:top-[-9px] before:right-[1rem] before:h-[16px] before:w-[16px] before:rotate-45 before:transform before:border-t-1 before:border-l-1 before:border-solid before:border-gray-400 before:bg-white before:content-['']",

        props.expanded ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {props.children}
    </div>
  );
};
