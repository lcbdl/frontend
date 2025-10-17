import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import "solid-devtools";
import { render } from "solid-js/web";
import { ConfirmModal } from "./components/ui/confirm-modal.tsx";
import { SnackbarProvider } from "./components/ui/snackbar.tsx";
import { ApiProvider } from "./context/api-context.tsx";
import { QueryProvider } from "./context/query-provider.tsx";
import "./index.css";
import { AppRoutes } from "./routes.tsx";

/**
 * This is used for developer local testing purpose.
 */
const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

const apiBaseUrl = import.meta.env.DEV ? "/api" : "/app/api";

render(
  () => (
    <SnackbarProvider>
      <ApiProvider baseUrl={apiBaseUrl}>
        <QueryProvider>
          <SolidQueryDevtools initialIsOpen={false} />
          <AppRoutes />
          <ConfirmModal />
        </QueryProvider>
      </ApiProvider>
    </SnackbarProvider>
  ),
  root!,
);
