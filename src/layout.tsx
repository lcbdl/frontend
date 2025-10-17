import { ParentComponent, Show } from "solid-js";
import { Header } from "./components/requests-manager/Header";
import { SideNavBar } from "./components/requests-manager/SideNavBar";
import { UnsavedChangesProvider } from "./context/UnsavedChangesContext";

/**
 * This is used for developer local testing purpose.
 */
export const AppLayout: ParentComponent = (props) => {
  return (
    <UnsavedChangesProvider>
      <section class="grid grid-cols-1 items-start divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-md">
        <Show when={import.meta.env.DEV}>
          <input type="hidden" id="_csrf" value="d1d66b40-7cad-4b54-83d6-8e278462ad9f" />
        </Show>
        {/*  Header Section  */}
        <Header />

        {/* <!-- Body Container --> */}
        <div class="grid grid-cols-1 lg:grid-cols-[288px_1fr_1fr_1fr]">
          {/* <!-- Left column --> */}
          <div class="grid grid-cols-1 gap-4">
            {/* <!-- Requests Manager Navigation --> */}
            <div class="flex flex-col gap-y-5 border-r border-gray-200 bg-gray-100 inset-shadow-sm inset-shadow-gray-200/50">
              <SideNavBar />
            </div>
          </div>
          {/* <!-- END Left column --> */}

          {/* <!-- Right column --> */}
          <div class="grid grid-cols-1 gap-4 bg-white lg:col-span-3">{props.children}</div>
        </div>
      </section>
    </UnsavedChangesProvider>
  );
};
