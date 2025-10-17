import type { DeliverySite } from "@/types/DeliverySite";
import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { DeliverySiteFeature, getFacilityFeatures } from "./DeliverySiteFeature";

describe("getFacilityFeatures", () => {
  it("returns correct translated features based on flags", () => {
    const site: DeliverySite = {
      ultraLowFlag: "Y",
      delFacilityFlag: "Y",
      palletRackingFlag: "N",
      standardFreezerFlag: "Y",
      heatingFlag: "Y",
      coolingFlag: "N",
      loadingDockExists: "Y",
    } as DeliverySite;

    const features = getFacilityFeatures(site);

    console.log(features);
    expect(features).toContain("deliverySite.features.ultraLowFlag");
    expect(features).toContain("deliverySite.features.delFacilityFlag");
    expect(features).toContain("deliverySite.features.standardFreezerFlag");
    expect(features).toContain("deliverySite.features.heatingFlag");
    expect(features).toContain("deliverySite.features.loadingDockExists");
    expect(features).not.toContain("deliverySite.features.palletRackingFlag");
  });
});

describe("DeliverySiteFeature", () => {
  it("renders facility features as span elements", () => {
    const site: DeliverySite = {
      ultraLowFlag: "Y",
      delFacilityFlag: "Y",
      palletRackingFlag: "N",
      standardFreezerFlag: "N",
      heatingFlag: "N",
      coolingFlag: "Y",
      loadingDockExists: "N",
    } as DeliverySite;

    render(() => <DeliverySiteFeature deliverySite={site} />);

    expect(screen.getByText("deliverySite.features.ultraLowFlag")).toBeInTheDocument();
    expect(screen.getByText("deliverySite.features.delFacilityFlag")).toBeInTheDocument();
    expect(screen.getByText("deliverySite.features.coolingFlag")).toBeInTheDocument(); // adjust to your translation
    expect(screen.queryByText("deliverySite.features.palletRackingFlag")).not.toBeInTheDocument();
  });
});
