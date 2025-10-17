import { useApi } from "@/context/api-context";
import { QueryProvider } from "@/context/query-provider";
import { MemberDetail } from "@/types/MemberDetail";
import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { MemberDirectory } from "./member-directory";

vi.mock("@/context/api-context", async () => {
  return { useApi: vi.fn() };
});

const mockData: MemberDetail[] = [
  {
    requestorProfileId: "8",
    requestorId: "3",
    requestorProvName: "Alberta",
    requestorProvShortName: "AB",
    profileNumber: "profileNumber",
    firstName: "Evgeny",
    lastName: "Ermolenko",
    contactName: "Evgeny Ermolenko",
    contactAuthority: "",
    contactEmail: "evgeny.ermolenko@canada.ca",
    contactPhoneNumber: "123-123-1234",
    receiverName: "",
    receiverPhoneNumber: "",
    streetNumber: "",
    streetName: "",
    city: "Ottawa",
    postalCode: "k3k3k3",
    sgAccountId: "",
    initial: "",
  },
  {
    requestorProfileId: "3",
    requestorId: "3",
    requestorProvName: "Alberta",
    requestorProvShortName: "AB",
    profileNumber: "",
    firstName: "Ling",
    lastName: "Han",
    contactName: "Ling Han",
    contactAuthority: "",
    contactEmail: "ling.han@canada.ca",
    contactPhoneNumber: "",
    receiverName: "",
    receiverPhoneNumber: "",
    streetNumber: "",
    streetName: "",
    city: "",
    postalCode: "",
    sgAccountId: "",
    initial: "",
  },
];

describe("MemberDirectory", () => {
  const mockApi = {
    get: vi.fn(),
  };

  beforeEach(() => {
    (useApi as Mock).mockReturnValue(mockApi);
  });

  it("fetches member directories and render them", async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockData });

    render(() => (
      <QueryProvider>
        <MemberDirectory />
      </QueryProvider>
    ));

    await waitFor(() => {
      expect(screen.getByText("Ling Han")).toBeInTheDocument();
      expect(screen.getByText("memberDirectory.title")).toBeInTheDocument();
    });
  });

  it("displays no member if the API returns an empty list", async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    render(() => (
      <QueryProvider>
        <MemberDirectory />
      </QueryProvider>
    ));

    await waitFor(() => {
      const directory = screen.getByLabelText("Directory");
      expect(directory).toBeInTheDocument();
      expect(directory.children.length).toEqual(0);
    });
  });

  it("displays filtered result when type in the search box", async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockData });

    render(() => (
      <QueryProvider>
        <MemberDirectory />
      </QueryProvider>
    ));

    await waitFor(() => {
      const directory = screen.getByLabelText("Directory");
      expect(directory).toBeInTheDocument();
      expect(directory.children.length).toEqual(2);
    });

    const searchInput = screen.getByLabelText(/memberDirectory.title/);
    expect(searchInput).toBeInTheDocument();

    fireEvent.input(searchInput, { target: { value: "Lin Han" } });

    waitFor(() => {
      const directory = screen.getByLabelText("Directory");
      expect(directory).toBeInTheDocument();
      expect(directory.children.length).toEqual(1);
    });
  });
});
