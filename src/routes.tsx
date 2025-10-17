import { AppLayout } from "@/layout.tsx";
import { Navigate, Route, Router } from "@solidjs/router";
import { Component } from "solid-js";
import { ComponentsPage } from "./pages/components.page.tsx";
import { DeliverySiteEditPage } from "./pages/delivery-site.edit.tsx";
import { DeliverySiteListPage } from "./pages/delivery-site.list.tsx";
import { FormFieldsPage } from "./pages/form-fields.page.tsx";

const isDevEnv = import.meta.env?.DEV;
const baseUrl = isDevEnv ? "/" : "/app/requests-manager";

/**
 * This is used for developer local testing purpose.
 */
export const AppRoutes: Component = () => {
  return (
    <Router root={AppLayout} base={baseUrl}>
      {/* Redirect root ("/") to "/delivery-site" */}
      <Route path="/" component={() => <Navigate href="/delivery-site" />} />
      <Route path="/delivery-site">
        <Route path="/" component={DeliverySiteListPage} />
        <Route path="edit" component={DeliverySiteEditPage} />
      </Route>
      <Route path={["/components"]} component={() => <ComponentsPage />} />
      <Route path={["/form-fields"]} component={() => <FormFieldsPage />} />
    </Router>
  );
};
