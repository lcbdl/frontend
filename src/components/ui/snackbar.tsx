// snackbar.tsx
import i18n from "@/i18n";
import { cn } from "@/utils/cls-util";
import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  ParentComponent,
  Show,
  useContext,
} from "solid-js";

export type SnackbarHorizontalOriginType = "center" | "left" | "right";
export type SnackbarVerticalOriginType = "top" | "bottom" | "center";
export type SnackbarVariantType = "success" | "error" | "info" | "warning";

export interface SnackbarState {
  open: boolean;
  variant?: SnackbarVariantType;
  autoHideDuration?: number;
  message: string;
  anchorOrigin?: { horizontal: SnackbarHorizontalOriginType; vertical: SnackbarVerticalOriginType };
}

export interface SnackbarContextType {
  open: (options: Omit<SnackbarState, "open">) => void;
  close: () => void;
  state: Accessor<SnackbarState>;
}

const SnackbarContext = createContext<SnackbarContextType>();

export const SnackbarProvider: ParentComponent = (props) => {
  const [state, setState] = createSignal<SnackbarState>({
    open: false,
    message: "",
    variant: "info",
    autoHideDuration: 4000,
    anchorOrigin: { horizontal: "right", vertical: "top" },
  });

  const open = (options: Omit<SnackbarState, "open">) => {
    // Assign default value if options don't have it.
    const mergedOptions = mergeProps(
      {
        variant: "info" as SnackbarVariantType,
        autoHideDuration: 4000,
        anchorOrigin: {
          horizontal: "right" as SnackbarHorizontalOriginType,
          vertical: "top" as SnackbarVerticalOriginType,
        },
      },
      options,
    );
    setState({ ...mergedOptions, open: true });
  };

  const close = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ open, close, state }}>
      {props.children}
      <Snackbar />
    </SnackbarContext.Provider>
  );
};

const Snackbar = () => {
  const { state, close } = useSnackbar();
  let closeButtonRef: HTMLButtonElement | undefined;
  let tabPressed = false;
  const [visible, setVisible] = createSignal(false);

  const getBackgroundColor = (type?: string) => {
    switch (type) {
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "info":
        return "bg-blue-600";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-gray-700";
    }
  };

  const getTextColor = (type?: string) => {
    return type === "warning" ? "text-gray-900" : "text-white";
  };

  const getHorizontalPosition = (horizontal?: string) => {
    switch (horizontal) {
      case "left":
        return "left-4";
      case "right":
        return "right-4";
      default:
        return "left-1/2 -translate-x-1/2";
    }
  };

  const getVerticalPosition = (vertical?: string) => {
    switch (vertical) {
      case "top":
        return "top-4";
      default:
        return "bottom-4";
    }
  };

  const handleCloseWithAnimation = async () => {
    setVisible(false);
    await new Promise((resolve) => setTimeout(resolve, 300));
    close(); // wait for animation to finish
  };

  // Animation + auto-hide effect
  createEffect(() => {
    if (state().open) {
      setVisible(true);
      const timeoutId = window.setTimeout(async () => {
        await handleCloseWithAnimation();
      }, state().autoHideDuration || 4000);

      onCleanup(() => clearTimeout(timeoutId));
    } else {
      setVisible(false);
    }
  });

  // Handle Escape + Tab keys
  createEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape" && state().open) {
        await handleCloseWithAnimation();
      }
      if (e.key === "Tab" && state().open && !tabPressed) {
        e.preventDefault();
        tabPressed = true;
        closeButtonRef?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
      tabPressed = false;
    });
  });

  return (
    <Show when={state().open}>
      <div
        class={cn(
          "fixed z-40 flex items-center gap-4 rounded-md p-4 shadow-lg transition-all duration-300 ease-in-out",
          visible() ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          getBackgroundColor(state().variant),
          getTextColor(state().variant),
          getHorizontalPosition(state().anchorOrigin?.horizontal),
          getVerticalPosition(state().anchorOrigin?.vertical),
        )}
        role={state().variant === "error" ? "alert" : "status"}
        aria-live={state().variant === "error" ? "assertive" : "polite"}
      >
        <p>{state().message}</p>
        <button
          aria-label={i18n.t("common.close")}
          ref={closeButtonRef}
          class="text-white"
          onClick={async () => {
            await handleCloseWithAnimation();
          }}
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Show>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error("useSnackbar must be used within a SnackbarProvider");
  return context;
};
