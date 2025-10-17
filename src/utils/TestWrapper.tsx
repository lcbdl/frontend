import { SnackbarProvider } from "@/components/ui/snackbar";
import { ApiContext, ApiContextType } from "@/context/api-context";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { AxiosInstance } from "axios";
import { vi } from "vitest";

export const createMockApiContext = (): ApiContextType => {
  return {
    apiClient: {} as AxiosInstance,
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    update: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  };
};

export const createTestWrapper = (mockApi: Partial<ReturnType<typeof createMockApiContext>> = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const defaultMocks = createMockApiContext();
  const mockContext = { ...defaultMocks, ...mockApi };

  return (props: { children: any }) => (
    <SnackbarProvider>
      <ApiContext.Provider value={mockContext}>
        <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
      </ApiContext.Provider>
    </SnackbarProvider>
  );
};
