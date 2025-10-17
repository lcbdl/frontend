import i18n from "@/i18n";
import { cn } from "@/utils/cls-util.ts";
import {
  JSX,
  ParentProps,
  Show,
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  useContext,
} from "solid-js";

type TriggerType = "click" | "hover" | "focus";

const OFFSET = 10;

interface PopoverContextProps {
  isOpen: () => boolean;
  openPopover: () => void;
  closePopover: () => void;
  popoverId: string;
  triggerTypes: TriggerType[];
}

const PopoverContext = createContext<Omit<PopoverContextProps, "popoverId">>();
// Global store to track the currently open Popover ID
const [activePopoverId, setActivePopoverId] = createSignal<string | null>(null);

interface PopoverProps {
  triggerTypes?: TriggerType | TriggerType[];
  title?: string;
  showCloseButton?: boolean;
  class?: string;
  children: JSX.Element[]; // Explicitly type children as an array of JSX elements
}

const normalizeTriggerTypes = (types?: TriggerType | TriggerType[]): TriggerType[] =>
  Array.isArray(types) ? types : types ? [types] : ["focus"];

export function Popover(props: PopoverProps) {
  const [popoverRef, setPopoverRef] = createSignal<HTMLDivElement>();

  const popoverId = createUniqueId();
  const titleId = `${popoverId}-title`;
  const contentId = `${popoverId}-content`;

  const finalTriggerTypes = normalizeTriggerTypes(props.triggerTypes);

  const mergedProps = mergeProps({ trigger: finalTriggerTypes, showCloseButton: true }, props);
  if (!mergedProps.children || mergedProps.children.length != 2) {
    throw new Error("Popover component must have exactly 2 children: PopoverTrigger and PopoverContent");
  }

  const [styles, setStyles] = createSignal<{ top?: string; left?: string; right?: string }>({});

  // Close this popover when ESC key is pressed.
  createEffect(() => {
    if (isOpen()) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          closePopover();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
    }
  });

  // Close this popover when another one opens
  createEffect(() => {
    if (activePopoverId() !== popoverId) {
      closePopover();
    }
  });

  const [isOpen, setIsOpen] = createSignal(false);

  // Adjust popover position to stay within viewport
  const updatePopoverPosition = () => {
    const ref = popoverRef();
    if (!ref) return;

    const popoverRect = ref.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    const contentWidth = popoverRect.width;
    const contentLeft = popoverRect.left;
    const contentRight = popoverRect.right;

    const newStyles: Record<string, string> = {};

    // If content is too wide for viewport, shrink it
    if (contentWidth + OFFSET * 2 >= viewportWidth) {
      newStyles.left = `${OFFSET}px`;
      newStyles.width = `${viewportWidth - OFFSET * 2}px`;
    } else {
      // If it's overflowing to the left
      if (contentLeft <= OFFSET) {
        newStyles.left = `${OFFSET}px`;
      }

      // If it's overflowing to the right
      if (contentRight >= viewportWidth - OFFSET - 30) {
        newStyles.right = `${OFFSET}px`;
      }
    }

    setStyles(newStyles);
  };

  const closePopover = () => setIsOpen(false);
  const openPopover = () => {
    setIsOpen(true);
    setActivePopoverId(popoverId);
    updatePopoverPosition();
  };

  return (
    <PopoverContext.Provider
      value={{
        isOpen,
        openPopover,
        closePopover,
        triggerTypes: mergedProps.triggerTypes as TriggerType[],
      }}
    >
      <div class="inline-block" style={{ width: "100%", height: "100%" }}>
        {mergedProps.children[0]}

        {/* Popover content (shown conditionally based on isOpen) */}
        <Show when={isOpen()}>
          <div
            ref={setPopoverRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby={mergedProps.title ? titleId : undefined}
            aria-describedby={contentId}
            class={cn(
              "absolute z-40 mt-1 block rounded-md border border-solid border-gray-400 bg-white px-3 text-sm whitespace-nowrap transition-all duration-300",
              isOpen() ? "opacity-100" : "pointer-events-none opacity-0",
              mergedProps.class,
            )}
            style={styles()}
          >
            <Show when={mergedProps.title}>
              <div class="mb-1 flex items-center justify-between border-b pt-1">
                <span id={titleId} class="my-2 mr-6 font-semibold text-gray-700">
                  {mergedProps.title}
                </span>
              </div>
            </Show>
            <Show when={mergedProps.showCloseButton}>
              <button
                tabindex="0"
                type="button"
                class={cn(
                  "absolute h-[24px] w-[24px] cursor-pointer rounded-full border border-gray-400 bg-white p-0 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none",
                  !!mergedProps.title ? "top-2 right-2" : "top-[-13px] right-[-13px]",
                )}
                onClick={closePopover}
              >
                <span class="sr-only">{i18n.t("common.close")}</span>
                <svg
                  style={{ height: "1.5rem", width: "1.5rem" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="1 1 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Show>
            <div id={contentId} class="w-full pt-2 pb-3">
              {mergedProps.children[1]}
            </div>
          </div>
        </Show>
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger(props: ParentProps<{ class?: string }>) {
  const context = useContext(PopoverContext);

  const handleClick = (e: MouseEvent) => {
    if (context?.triggerTypes.includes("click")) {
      context.openPopover();
      e.stopPropagation(); // To prevent triggering the parent click event
    }
  };

  const handleMouseEnter = () => {
    if (context?.triggerTypes.includes("hover")) {
      context.openPopover();
    }
  };

  const handleMouseLeave = () => {
    if (context?.triggerTypes.includes("hover")) {
      context.closePopover();
    }
  };

  const handleFocusIn = () => {
    if (context?.triggerTypes.includes("focus")) {
      context.openPopover();
    }
  };

  return (
    // Apply event handlers directly to the child element
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusIn={handleFocusIn}
    >
      {props.children}
    </div>
  );
}

export function PopoverContent(props: ParentProps<{ class?: string }>) {
  const context = useContext(PopoverContext);

  return (
    <div class={props.class || ""}>
      <Show when={context?.isOpen()}>{props.children}</Show>
    </div>
  );
}
