import { cn } from "@/utils/cls-util";
import { getFocusableElements } from "@/utils/common-utils";
import { ChevronDown, ChevronRight } from "lucide-solid";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  JSXElement,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
} from "solid-js";

type AccordionItemRef = {
  updateHeight: () => void;
};

type AccordionContextType = {
  activeIndexes: () => number[];
  toggleIndex: (index: number) => void;
  isMulti: boolean;
  registerItem: (index: number, ref: AccordionItemRef) => void;
  unregisterItem: (index: number) => void;
  recalculateHeight: (index: number) => void;
};

type AccordionProps = {
  activeIndex?: number[];
  isMulti?: boolean;
  onChange?: (indexes: number[]) => void;
  children: JSXElement;
  disabled?: boolean;
  collapsible?: boolean; // Default true - allows all items to be closed. Set to false to keep at least one open
  autoResize?: boolean;
  backgroundColour?: string;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "class">;

export const AccordionContext = createContext<AccordionContextType>();

export const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionItem must be used within Accordion");
  }
  return context;
};

// Hook for children components to trigger height recalculation
export const useAccordionResize = () => {
  const context = useAccordionContext();
  return (index?: number) => {
    if (index !== undefined) {
      context.recalculateHeight(index);
    } else {
      // Recalculate all open items
      context.activeIndexes().forEach((idx) => context.recalculateHeight(idx));
    }
  };
};

export function Accordion(props: AccordionProps) {
  const [local, restProps] = splitProps(props, [
    "activeIndex",
    "isMulti",
    "onChange",
    "children",
    "disabled",
    "collapsible",
    "autoResize",
    "backgroundColour",
  ]);

  const [indexes, setIndexes] = createSignal(local.activeIndex || []);

  // Store references to all accordion items
  const itemRefs = new Map<number, AccordionItemRef>();

  createEffect(() => {
    if (local.activeIndex !== undefined) {
      setIndexes(local.activeIndex);
    }
  });

  const toggleIndex = (index: number) => {
    if (local.disabled) return;

    const current = indexes();
    let updated: number[];

    if (current.includes(index)) {
      // Always allow closing unless explicitly prevented by collapsible=false
      if (local.collapsible === false && !local.isMulti && current.length === 1) {
        return; // Don't close the last item if collapsible is explicitly false
      }
      updated = current.filter((i) => i !== index);
    } else {
      updated = local.isMulti ? [...current, index] : [index];
    }

    setIndexes(updated);
    local.onChange?.(updated);
  };

  const registerItem = (index: number, ref: AccordionItemRef) => {
    itemRefs.set(index, ref);
  };

  const unregisterItem = (index: number) => {
    itemRefs.delete(index);
  };

  const recalculateHeight = (index: number) => {
    const ref = itemRefs.get(index);
    if (ref) {
      ref.updateHeight();
    }
  };

  const contextValue = createMemo(() => ({
    activeIndexes: indexes,
    toggleIndex,
    isMulti: !!local.isMulti,
    registerItem,
    unregisterItem,
    recalculateHeight,
  }));

  return (
    <AccordionContext.Provider value={contextValue()}>
      <div
        class={cn(
          "divide-y divide-sky-700/20 text-sky-800",
          local.disabled && "pointer-events-none opacity-60",
          local.backgroundColour || "bg-white",
        )}
        role="region"
        aria-label="Accordion"
        data-auto-resize={local.autoResize ?? true}
        {...restProps}
      >
        {local.children}
      </div>
    </AccordionContext.Provider>
  );
}

type AccordionItemProps = {
  index: number;
  selectedValueCount?: number;
  children: JSXElement;
  title: JSXElement;
  disabled?: boolean;
  "aria-describedby"?: string;
  minHeight?: number;
  maxHeight?: number;
  buttonClass?: string;
  contentClass?: string;
  chevronClass?: string;
  chevronRight?: boolean;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange">;

export function AccordionItem(props: AccordionItemProps) {
  const accordionContext = useAccordionContext();

  const [local, restProps] = splitProps(props, [
    "index",
    "children",
    "title",
    "class",
    "aria-describedby",
    "disabled",
    "minHeight",
    "maxHeight",
    "buttonClass",
    "contentClass",
    "chevronClass",
    "chevronRight",
  ]);

  const isOpen = createMemo(() => accordionContext.activeIndexes().includes(local.index));
  const isDisabled = createMemo(() => local.disabled || false);

  const [currentHeight, setCurrentHeight] = createSignal("0px");
  const [visible, setVisible] = createSignal(false);
  const [isAnimating, setIsAnimating] = createSignal(false);

  let contentRef: HTMLDivElement | undefined;
  let contentContainer: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let mutationObserver: MutationObserver | undefined;
  let animationTimeout: NodeJS.Timeout | undefined;
  let heightCheckInterval: NodeJS.Timeout | undefined;

  // Store last known height to detect changes
  let lastKnownHeight = 0;

  const updateHeight = () => {
    if (!contentContainer) return;

    const newHeight = contentContainer.scrollHeight;

    // Only update if height actually changed
    if (newHeight !== lastKnownHeight) {
      lastKnownHeight = newHeight;

      if (isOpen()) {
        // Apply min/max height constraints
        let finalHeight = newHeight;
        if (local.minHeight) finalHeight = Math.max(finalHeight, local.minHeight);
        if (local.maxHeight) finalHeight = Math.min(finalHeight, local.maxHeight);

        setCurrentHeight(`${finalHeight}px`);
      }
    }
  };

  // Debounced version for frequent updates
  const debouncedUpdateHeight = () => {
    if (animationTimeout) clearTimeout(animationTimeout);
    animationTimeout = setTimeout(updateHeight, 16); // ~60fps
  };

  // Register with parent accordion
  onMount(() => {
    const itemRef: AccordionItemRef = {
      updateHeight: updateHeight,
    };

    accordionContext.registerItem(local.index, itemRef);

    if (!contentRef) return;

    // Get auto-resize setting from parent
    const accordionElement = contentRef.closest("[data-auto-resize]");
    const autoResize = accordionElement?.getAttribute("data-auto-resize") !== "false";

    // Strategy 1: ResizeObserver (most reliable)
    if (window.ResizeObserver && autoResize) {
      try {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const height = entry.contentBoxSize?.[0]?.blockSize || entry.contentRect.height;
            if (height !== lastKnownHeight && isOpen()) {
              debouncedUpdateHeight();
            }
          }
        });
        resizeObserver.observe(contentRef);
      } catch (error) {
        console.warn("ResizeObserver failed:", error);
      }
    }

    // Strategy 2: MutationObserver (for DOM changes)
    if (window.MutationObserver && autoResize) {
      try {
        mutationObserver = new MutationObserver((mutations) => {
          let shouldUpdate = false;

          mutations.forEach((mutation) => {
            if (
              mutation.type === "childList" ||
              (mutation.type === "attributes" && ["style", "class", "hidden"].includes(mutation.attributeName || ""))
            ) {
              shouldUpdate = true;
            }
          });

          if (shouldUpdate && isOpen()) {
            debouncedUpdateHeight();
          }
        });

        mutationObserver.observe(contentRef, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style", "class", "hidden"],
        });
      } catch (error) {
        console.warn("MutationObserver failed:", error);
      }
    }

    // Strategy 3: Polling fallback
    if (autoResize) {
      heightCheckInterval = setInterval(() => {
        if (isOpen()) {
          updateHeight();
        }
      }, 500);
    }
  });

  onCleanup(() => {
    accordionContext.unregisterItem(local.index);

    if (resizeObserver && contentRef) {
      resizeObserver.unobserve(contentRef);
    }
    if (mutationObserver) {
      mutationObserver.disconnect();
    }
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    if (heightCheckInterval) {
      clearInterval(heightCheckInterval);
    }
  });

  // Track if accordion was opened via user interaction
  const [shouldFocusContent, setShouldFocusContent] = createSignal(false);

  // Handle open/close state changes
  createEffect(() => {
    if (isOpen()) {
      setIsAnimating(true);
      setVisible(true);

      // Initial height calculation
      requestAnimationFrame(() => {
        updateHeight();

        setTimeout(() => {
          setIsAnimating(false);

          // Focus management after animation completes
          if (shouldFocusContent() && contentContainer) {
            const focusables = getFocusableElements(contentContainer);
            const firstFocusable = Array.from(focusables).find(
              (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
            );

            if (firstFocusable) {
              firstFocusable.focus();
            }
            setShouldFocusContent(false); // Reset flag
          }
        }, 320); // Slightly longer than animation duration
      });
    } else {
      setIsAnimating(true);
      setCurrentHeight("0px");
      lastKnownHeight = 0;
      setShouldFocusContent(false); // Reset flag when closing

      setTimeout(() => {
        setVisible(false);
        setIsAnimating(false);
      }, 300);
    }
  });

  // Manage tab index for accessibility
  createEffect(() => {
    if (!contentContainer) return;

    const focusables = getFocusableElements(contentContainer);
    focusables.forEach((el) => {
      el.tabIndex = isOpen() ? 0 : -1;
    });
  });

  const handleClick = () => {
    if (isDisabled()) return;

    // Set flag to focus content if this click opens the accordion
    if (!isOpen()) {
      setShouldFocusContent(true);
    }

    accordionContext.toggleIndex(local.index);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isDisabled()) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();

        // Set flag to focus content if this keypress opens the accordion
        if (!isOpen()) {
          setShouldFocusContent(true);
        }

        accordionContext.toggleIndex(local.index);
        break;
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        const buttons = document.querySelectorAll("button[aria-expanded]");
        const current = Array.from(buttons).indexOf(event.currentTarget as Element);
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        const target = buttons[next] || buttons[event.key === "ArrowDown" ? 0 : buttons.length - 1];
        (target as HTMLElement)?.focus();
        break;
    }
  };

  return (
    <div class={cn("group", isDisabled() && "opacity-50")}>
      <button
        type="button"
        class={cn(
          "w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200",
          "focus:ring-2 focus:ring-sky-500 focus:outline-none focus:ring-inset",
          !isDisabled() && "hover:bg-sky-50",
          isDisabled() && "cursor-not-allowed",
          local.buttonClass,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen()}
        aria-labelledby={`accordion-header-${local.index}`}
        aria-controls={`accordion-content-${local.index}`}
        aria-describedby={local["aria-describedby"]}
        aria-disabled={isDisabled()}
        disabled={isDisabled()}
      >
        <div class="flex w-full items-center justify-between">
          <span role="heading" aria-level={2} id={`accordion-header-${local.index}`} class="capitalize">
            {local.title}
          </span>

          <span class={cn("ml-2 flex items-center justify-between", local.chevronClass)}>
            <Show when={(props.selectedValueCount ?? 0) > 0}>
              <div
                class="mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-700 text-[0.7rem] text-white"
                aria-label={`${props.selectedValueCount} selected`}
              >
                {props.selectedValueCount}
              </div>
            </Show>
            {props.chevronRight ? (
              <ChevronRight
                size={16}
                class={cn(
                  "transition-transform duration-300",
                  !isDisabled() && "cursor-pointer",
                  isOpen() && "rotate-90",
                )}
                aria-hidden="true"
              />
            ) : (
              <ChevronDown
                size={16}
                class={cn(
                  "transition-transform duration-300",
                  !isDisabled() && "cursor-pointer",
                  isOpen() && "rotate-180",
                )}
                aria-hidden="true"
              />
            )}
          </span>
        </div>
      </button>

      {/* Collapsible Content with Dynamic Height */}
      <div
        id={`accordion-content-${local.index}`}
        ref={contentRef}
        class={cn(
          "origin-top transform-gpu overflow-hidden bg-sky-50/60 text-sm inset-shadow-sm inset-shadow-sky-200/10 transition-all duration-300 ease-in-out",
          isOpen() ? "scale-y-100 opacity-100" : "scale-y-95 opacity-0",
          visible() ? "pointer-events-auto" : "pointer-events-none",
          isAnimating() && "will-change-transform",
          local.contentClass,
        )}
        style={{
          "max-height": currentHeight(),
          transition: "max-height 300ms ease-in-out, opacity 300ms ease-in-out, transform 300ms ease-in-out",
        }}
        role="region"
        aria-hidden={!isOpen()}
        aria-labelledby={`accordion-header-${local.index}`}
        {...restProps}
      >
        <div
          class={cn(
            "px-4 py-3 text-sm inset-shadow-sm inset-shadow-sky-200/10",
            local.maxHeight && "overflow-y-auto",
            local.contentClass,
          )}
          style={{
            "max-height": local.maxHeight ? `${local.maxHeight}px` : undefined,
          }}
          ref={contentContainer}
        >
          {local.children}
        </div>
      </div>
    </div>
  );
}

// Utility component for content that needs to trigger height updates
export function AccordionContent(props: { children: JSXElement; class?: string }) {
  const recalculateHeight = useAccordionResize();

  // Auto-trigger height recalculation when content changes
  createEffect(() => {
    // This will run when children change
    // eslint-disable-next-line
    props.children;

    // Small delay to ensure DOM has updated
    setTimeout(() => {
      recalculateHeight();
    }, 50);
  });

  return <div class={props.class}>{props.children}</div>;
}
