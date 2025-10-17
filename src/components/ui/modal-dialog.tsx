import { cn } from "@/utils/cls-util";
import { JSX, ParentComponent, Show, createEffect, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string | JSX.Element;
  showCloseButton?: boolean;
  actions?: JSX.Element;
  containerClass?: string;
};

export const Modal: ParentComponent<ModalProps> = (props) => {
  let modalRef: HTMLDivElement | undefined;

  const focusFirstElement = () => {
    if (!modalRef) return;
    const focusable = modalRef.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]):not([disabled])',
    );
    focusable[0]?.focus();
  };

  const trapFocus = (e: KeyboardEvent) => {
    if (!modalRef || e.key !== "Tab") return;

    const focusable = modalRef.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]):not([disabled])',
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      props.onClose();
    } else if (e.key === "Tab") {
      trapFocus(e);
    }
  };

  createEffect(() => {
    if (props.open) {
      const previouslyFocused = document.activeElement as HTMLElement;
      const timer = setTimeout(focusFirstElement, 0); // Ensure the modal is rendered before focusing
      window.addEventListener("keydown", handleKeyDown);
      onCleanup(() => {
        window.removeEventListener("keydown", handleKeyDown);
        previouslyFocused?.focus();
        clearTimeout(timer);
      });
    }
  });

  return (
    <Show when={props.open}>
      <Portal>
        <div
          class={cn("fixed inset-0 z-30 flex items-center overflow-y-auto bg-black/50 pb-[5vh]", props.containerClass)}
          aria-hidden={!props.open}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            class="relative mt-[5vh] w-full max-w-lg rounded-xl bg-white p-6 shadow-lg"
            tabIndex={-1}
          >
            <Show when={props.showCloseButton !== false}>
              <button
                class="absolute top-2 right-3 cursor-pointer rounded-full px-1.5 text-2xl text-gray-600 select-none hover:bg-slate-200"
                onClick={() => props.onClose()}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </Show>

            {props.title && (
              <div id="modal-title" class="mb-5 text-xl font-bold">
                {props.title}
              </div>
            )}

            <div class="mb-4">{props.children}</div>

            {props.actions && <div class="flex justify-end gap-2">{props.actions}</div>}
          </div>
        </div>
      </Portal>
    </Show>
  );
};
