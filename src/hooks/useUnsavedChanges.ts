import { confirmDialog } from "@/components/ui/confirm-modal";
import i18n from "@/i18n";
import { useBeforeLeave, useNavigate } from "@solidjs/router";
import { Accessor, onCleanup, onMount } from "solid-js";

export function useUnsavedChanges(isDirty: Accessor<boolean>, msg?: string) {
  const navigate = useNavigate();

  const message = msg ?? i18n.t("modal.unsavedChangesWarning");

  // Temporary flag to bypass useBeforeLeave once
  //  * Changes in this version:
  //  * ------------------------
  //  * 1. Uses async confirmDialog for safeNavigate to support custom modals and i18n.
  //  * 2. Introduces `skipBeforeLeave` flag to prevent double confirmation:
  //  *    - Without it, navigating via safeNavigate would trigger both the modal
  //  *      and the useBeforeLeave confirm dialog.
  //  * 3. Navigation is removed from safeNavigate's confirmation block and handled
  //  *    after setting skipBeforeLeave, ensuring only a single confirmation is shown.
  //  * 4. forceNavigate now also uses skipBeforeLeave to bypass all confirmations.
  //  *
  //  * Browser-level navigation (refresh, close tab) remains protected via beforeunload.
  let skipBeforeLeave = false;

  // Handle router navigation (back button, address bar changes, etc.)
  useBeforeLeave((e) => {
    if (skipBeforeLeave) {
      skipBeforeLeave = false; // reset
      return;
    }

    if (isDirty()) {
      const shouldLeave = confirm(message);
      if (!shouldLeave) {
        e.preventDefault();
      }
    }
  });

  // Handle browser navigation (refresh, close tab, etc.)
  onMount(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    onCleanup(() => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    });
  });

  // Safe navigate function that show warning confirmation
  const safeNavigate = async (path: string, navigateOptions?: any) => {
    if (isDirty()) {
      const shouldLeave = await confirmDialog(message);
      if (!shouldLeave) return;
    }

    skipBeforeLeave = true; // bypass the next router confirmation
    forceNavigate(path, navigateOptions);
  };

  const safeCall = async (func: () => void) => {
    if (isDirty()) {
      const shouldLeave = await confirmDialog(message);
      if (!shouldLeave) return;
    }
    func();
  };

  // Force navigate without any checks
  const forceNavigate = (path: string, navigateOptions?: any) => {
    skipBeforeLeave = true; // bypass the next router confirmation
    navigate(path, navigateOptions);
  };

  return {
    safeNavigate,
    safeCall,
    forceNavigate,
  };
}
