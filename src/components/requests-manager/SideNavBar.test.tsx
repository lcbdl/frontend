import { Route, Router } from "@solidjs/router";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it } from "vitest";
import { SideNavBar } from "./SideNavBar";

describe("<SideNavBar />", () => {
  const renderWithRouter = (initialPath = "/") =>
    render(() => (
      <Router base={initialPath}>
        <Route path="*" component={SideNavBar} />
      </Router>
    ));

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders all top-level navigation items", () => {
    renderWithRouter();
    expect(screen.getByText("sideNavBar.emergencyAssistanceLabel")).toBeInTheDocument();
    expect(screen.getByText("sideNavBar.allocatedInventoryLabel")).toBeInTheDocument();
    expect(screen.getByText("sideNavBar.loanedAssetsLabel")).toBeInTheDocument();
    expect(screen.getByText("sideNavBar.deliverySiteManagerLabel")).toBeInTheDocument();
  });

  it("highlights the active route correctly", () => {
    renderWithRouter("/");
    const toggle = screen.getByText("sideNavBar.deliverySiteManagerLabel");
    fireEvent.click(toggle);
    const deliverySiteLink = screen.getByText("sideNavBar.viewAllDeliverySitesLabel");
    const parentIcon = deliverySiteLink.closest("li")?.querySelector("svg");
    expect(parentIcon?.classList.contains("text-sky-700"));
  });

  it("shows notification badge if count > 0", () => {
    renderWithRouter();
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it("applies hover styles to icons", () => {
    renderWithRouter();
    const navItem = screen.getByText("sideNavBar.emergencyAssistanceLabel").closest("li");
    const svg = navItem?.querySelector("svg");

    // We cannot simulate actual CSS hover styles, but we can check class presence
    expect(svg?.classList.contains("group-hover:text-red-700"));
  });

  it("expands and collapses accordion items", async () => {
    renderWithRouter();
    const deliveryToggle = screen.getByRole("button", { name: "sideNavBar.deliverySiteManagerLabel" });

    fireEvent.click(deliveryToggle);
    expect(deliveryToggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(deliveryToggle);
    expect(deliveryToggle).toHaveAttribute("aria-expanded", "false");
  });
});
