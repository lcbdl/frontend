import { ViewDeliverySite } from "@/components/delivery-sites/ViewDeliverySite";
import { createTestWrapper } from "@/utils/TestWrapper";
import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock useNavigate from Solid Router
const navigateMock = vi.fn();
vi.mock("@solidjs/router", () => ({
  useNavigate: () => navigateMock,
}));

// Sample mock delivery site
const mockDeliverySite = {
  deliverySiteName: "Test Site",
  siteNumber: "123",
  contacts: [
    {
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "555-1234",
      extension: "567",
      emailAddress: "john@example.com",
      primaryFlag: "Y",
    },
  ],
  address: "123 Test St",
  city: "Testville",
  province: { provinceShortName: "ON" },
  postalCode: "T3S 7T8",
  country: "Canada",
  deliveryInstructions: "Leave at dock.",
  attachments: [
    {
      fileName: "testfile.pdf",
      attachmentId: 1001,
      fileSize: 1024 * 1024,
    },
  ],
};

describe("ViewDeliverySite Component", () => {
  const mockApi = {
    get: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.clearAllTimers();
    mockApi.get.mockResolvedValueOnce({ data: mockDeliverySite });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders the view button", () => {
    render(() => <ViewDeliverySite deliverySiteId={1} />, {
      wrapper: createTestWrapper(mockApi),
    });
    expect(screen.getByText("common.view")).toBeInTheDocument();
  });

  it("displays attached files", async () => {
    render(() => <ViewDeliverySite deliverySiteId={1} />, {
      wrapper: createTestWrapper(mockApi),
    });
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText(/testfile\.pdf \(1\.00 MB\)/)).toBeInTheDocument();
    });
  });

  it("clicking edit navigates to edit screen", async () => {
    render(() => <ViewDeliverySite deliverySiteId={1} />, {
      wrapper: createTestWrapper(mockApi),
    });
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Edit details")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit details"));
    expect(navigateMock).toHaveBeenCalledWith("/edit?id=1");
  });
});
