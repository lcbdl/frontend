// UnsavedChangesContext.tsx
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { Accessor, ParentComponent, createContext, createSignal, useContext } from "solid-js";

type UnsavedChangesContextType = {
  safeNavigate: (path: string, options?: any) => void;
  safeCall: (func: () => void) => void;
  forceNavigate: (path: string, options?: any) => void;
  registerForm?: (isDirty: Accessor<boolean>) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType>();

export function useUnsavedChangesContext(isDirty?: Accessor<boolean>) {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error("useUnsavedChangesContext must be used within UnsavedChangesProvider");
  }

  // If isDirty is provided, register the form
  if (isDirty && context.registerForm) {
    context.registerForm(isDirty);
  }

  // Always return navigation functions
  return {
    safeNavigate: context.safeNavigate,
    forceNavigate: context.forceNavigate,
    safeCall: context.safeCall,
  };
}

export const UnsavedChangesProvider: ParentComponent = (props) => {
  const [currentForm, setCurrentForm] = createSignal<Accessor<boolean> | null>(null);

  const { safeNavigate, forceNavigate, safeCall } = useUnsavedChanges(() => currentForm()?.() || false);

  const registerForm = (isDirty: Accessor<boolean>) => {
    // Set this form as the current active form
    setCurrentForm(() => isDirty);
  };

  return (
    <UnsavedChangesContext.Provider
      value={{
        safeNavigate,
        forceNavigate,
        safeCall,
        registerForm,
      }}
    >
      {props.children}
    </UnsavedChangesContext.Provider>
  );
};
