import { MemberDirectory } from "@/components/member-directory";
import { SharedCalendar } from "@/components/shared-calendar.tsx";
import { type Component } from "solid-js";

const ResponseHubPage: Component = () => {
  return (
    <>
      <input type="hidden" id="_csrf" value="19826ec1-5863-4c4d-b7da-eff406e61ccf" />
      <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
        {/* left column */}
        <div class="grid grid-cols-1 gap-4 lg:col-span-2">{/* <NationalDocumentRepository /> */}</div>
        {/* right column */}
        <div class="order-last grid grid-cols-1 gap-4">
          <SharedCalendar />
          <MemberDirectory />
        </div>
      </div>
    </>
  );
};

export default ResponseHubPage;
