import { render, waitFor } from "@solidjs/testing-library";
import axios from "axios";
import { Component } from "solid-js";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { ApiProvider, useApi } from "./api-context.tsx";

vi.mock("axios");
const mockedAxios = axios.create as unknown as Mock;

describe("ApiProvider", () => {
  let mockGet: Mock;
  let mockPost: Mock;
  let mockPut: Mock;
  let mockDelete: Mock;

  beforeEach(() => {
    mockGet = vi.fn().mockResolvedValue({ data: "get response" });
    mockPost = vi.fn().mockResolvedValue({ data: "post response" });
    mockPut = vi.fn().mockResolvedValue({ data: "put response" });
    mockDelete = vi.fn().mockResolvedValue({ data: "delete response" });

    mockedAxios.mockReturnValue({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    });
  });

  const TestComponent: Component = () => {
    const { get, post, update, delete: remove } = useApi();

    return (
      <div>
        <button
          onClick={async () => {
            const res = await get("/test");
            document.body.setAttribute("data-get", String(res));
          }}
        >
          Get
        </button>
        <button
          onClick={async () => {
            const res = await post("/test", { foo: "bar" });
            document.body.setAttribute("data-post", String(res));
          }}
        >
          Post
        </button>
        <button
          onClick={async () => {
            const res = await update("/test", { id: 1 });
            document.body.setAttribute("data-put", String(res));
          }}
        >
          Put
        </button>
        <button
          onClick={async () => {
            const res = await remove("/test");
            document.body.setAttribute("data-delete", String(res));
          }}
        >
          Delete
        </button>
      </div>
    );
  };

  it("calls get, post, update, and delete methods correctly", async () => {
    const { getByText } = render(() => (
      <ApiProvider baseUrl="https://api.example.com">
        <TestComponent />
      </ApiProvider>
    ));

    await getByText("Get").click();
    waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/test", { params: undefined });
      expect(document.body.getAttribute("data-get")).toBe("get response");
    });

    await getByText("Post").click();
    waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/test", { foo: "bar" });
      expect(document.body.getAttribute("data-post")).toBe("post response");
    });

    await getByText("Put").click();
    waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith("/test", { id: 1 });
      expect(document.body.getAttribute("data-put")).toBe("put response");
    });

    await getByText("Delete").click();
    waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("/test");
      expect(document.body.getAttribute("data-delete")).toBe("delete response");
    });
  });

  it("throws an error if useApi is used outside of provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {}); // suppress error output
    expect(() =>
      render(() => {
        const UnauthorizedUse = () => {
          useApi(); // should throw
          return null;
        };
        return <UnauthorizedUse />;
      }),
    ).toThrow("useApi must be used within an ApiProvider");

    spy.mockRestore();
  });
});
