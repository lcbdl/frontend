import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { ParentComponent } from "solid-js";

const queryClient = new QueryClient();

export const QueryProvider: ParentComponent = (props) => {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};
