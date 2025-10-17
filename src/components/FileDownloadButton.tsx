import { useApi } from "@/context/api-context";
import { cn } from "@/utils/cls-util";
import { useMutation } from "@tanstack/solid-query";
import axios from "axios";
import { ParentComponent } from "solid-js";
import { useSnackbar } from "./ui/snackbar";

// Types
interface FileDownloadButtonProps {
  fileId: string;
  class?: string;
}

interface DownloadResult {
  data: Blob;
  headers: Record<string, string>;
  fileId: string;
}

export const FileDownloadButton: ParentComponent<FileDownloadButtonProps> = (props) => {
  const api = useApi();
  const snackbar = useSnackbar();
  const downloadMutation = useMutation(() => ({
    mutationFn: async (fileId: string): Promise<DownloadResult> => {
      const response = await api.get<Blob>(`/file/${fileId}`, {
        responseType: "blob", // Important: Handle binary data
        headers: {
          Accept: "*/*",
        },
      });

      return {
        data: response.data,
        headers: response.headers as Record<string, string>,
        fileId,
      };
    },
    onSuccess: (result: DownloadResult) => {
      // Extract filename from Content-Disposition header
      const contentDisposition = result.headers["content-disposition"];
      let filename = `file_${result.fileId}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(result.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error: Error) => {
      console.error("Download failed:", error);
      let message: string;
      // Better error handling based on error type
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          message = "File not found";
        } else if (error.response?.status === 403) {
          message = "Access denied";
        } else if (error.code === "ECONNABORTED") {
          message = "Download timeout - file may be too large";
        } else {
          message = `Download failed: ${error.response?.statusText || error.message}`;
        }
      } else {
        message = "An unexpected error occurred";
      }
      snackbar.open({
        message,
        variant: "error",
        autoHideDuration: 7000,
      });
    },
  }));

  const handleDownload = (): void => {
    if (!props.fileId) {
      console.error("File ID is required");
      return;
    }
    downloadMutation.mutate(props.fileId);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloadMutation.isPending || !props.fileId}
      class={cn(
        "inline-flex items-center rounded-full border border-green-700 bg-white px-2.5 py-0.5 text-sm leading-5 font-medium text-green-700 shadow-sm transition ease-in-out hover:bg-green-700 hover:text-white focus:ring-2 focus:ring-green-700 focus:ring-offset-2 focus:ring-offset-blue-50 focus:outline-none",
        props.class,
      )}
    >
      {props.children}
    </button>
  );
};
