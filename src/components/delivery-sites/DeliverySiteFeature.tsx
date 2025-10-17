import i18n from "@/i18n";
import { DeliverySite } from "@/types/DeliverySite";
import { createMemo, For } from "solid-js";

export const getFacilityFeatures = (site: DeliverySite) => {
  const features: string[] = [];
  if (site.ultraLowFlag === "Y") {
    features.push(i18n.t("deliverySite.features.ultraLowFlag"));
  }
  if (site.delFacilityFlag === "Y") {
    features.push(i18n.t("deliverySite.features.delFacilityFlag"));
  }
  if (site.palletRackingFlag === "Y") {
    features.push(i18n.t("deliverySite.features.palletRackingFlag"));
  }
  if (site.standardFreezerFlag === "Y") {
    features.push(i18n.t("deliverySite.features.standardFreezerFlag"));
  }
  if (site.heatingFlag === "Y") {
    features.push(i18n.t("deliverySite.features.heatingFlag"));
  }
  if (site.coolingFlag === "Y") {
    features.push(i18n.t("deliverySite.features.coolingFlag"));
  }
  if (site.loadingDockExists === "Y") {
    features.push(i18n.t("deliverySite.features.loadingDockExists"));
  }
  return features;
};

export const DeliverySiteFeature = (props: { deliverySite: DeliverySite }) => {
  const features = createMemo(() => getFacilityFeatures(props.deliverySite));

  return (
    <div class="flex flex-col">
      <For each={features()}>{(item) => <span class="inline-block px-0.5 text-sm">{item}</span>}</For>
    </div>
  );
};
