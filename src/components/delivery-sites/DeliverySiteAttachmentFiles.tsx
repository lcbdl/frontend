import { useApi } from "@/context/api-context";
import { DeliverySiteAttachment } from "@/types/DeliverySiteAttachment";
import { useMutation } from "@tanstack/solid-query";
import axios from "axios";
import { For, Show } from "solid-js";
import { Button } from "../ui/button";
import { useSnackbar } from "../ui/snackbar";

interface DownloadResult {
  data: Blob;
  headers: Record<string, string>;
  fileName?: string;
}

export const DeliverySiteAttachmentsFiles = (props: {
  title: string;
  deliverySiteId?: number;
  attachments?: DeliverySiteAttachment[];
  deletable?: boolean;
  onDelete?: (attachmentId: number) => void;
}) => {
  const api = useApi();
  const snackbar = useSnackbar();
  const downloadMutation = useMutation(() => ({
    mutationFn: async ({
      deliverySiteId,
      attachment,
    }: {
      deliverySiteId: number;
      attachment: DeliverySiteAttachment;
    }): Promise<DownloadResult> => {
      const response = await api.get<Blob>(`/delivery-sites/${deliverySiteId}/attachments/${attachment.attachmentId}`, {
        responseType: "blob", // Important: Handle binary data
        headers: {
          Accept: "*/*",
        },
      });

      return {
        data: response.data,
        headers: response.headers as Record<string, string>,
        fileName: attachment.fileName,
      };
    },
    onSuccess: (result: DownloadResult) => {
      // Extract filename from Content-Disposition header
      const contentDisposition = result.headers["content-disposition"];
      let filename = `file_${result.fileName}`;

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

  const handleDownload = (attachment: DeliverySiteAttachment): void => {
    downloadMutation.mutate({ deliverySiteId: props.deliverySiteId!, attachment });
  };

  return (
    <dl>
      <dt class="my-2 font-medium text-gray-900">{props.title}</dt>
      <For each={props.attachments ?? []}>
        {(attachment) => (
          <dd>
            <a
              role="button"
              download={attachment.fileName}
              aria-label={`Download ${attachment.fileName}, size ${((attachment.fileSize ?? 0) / (1024 * 1024)).toFixed(2)} MB`}
              class="my-1 inline-block cursor-pointer rounded-md bg-sky-100 px-2 py-1 text-sm font-medium text-sky-900 transition ease-in-out hover:bg-sky-200/70"
              onClick={() => handleDownload(attachment)}
            >
              <svg
                aria-hidden="true"
                class="-mt-1 mr-2 inline-flex h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                aria-labelledby="alb_9_txt_2_43"
              >
                <path
                  fill="currentColor"
                  d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"
                  class=""
                />
              </svg>
              <span aria-label={`File size ${((attachment.fileSize ?? 0) / (1024 * 1024)).toFixed(2)} megabytes`}>
                {attachment.fileName} ({((attachment.fileSize ?? 0) / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </a>
            <Show when={props.deletable}>
              <Button
                type="button"
                variant="flat"
                class="text-gray-500 hover:text-red-700"
                onClick={() => props.onDelete?.(attachment.attachmentId!)}
              >
                <svg
                  aria-hidden="true"
                  class="my-auto mr-1 -ml-1 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clip-rule="evenodd"
                    d="M0 84V56c0-13.3 10.7-24 24-24h112l9.4-18.7c4-8.2 12.3-13.3 21.4-13.3h114.3c9.1 0 17.4 5.1 21.5 13.3L312 32h112c13.3 0 24 10.7 24 24v28c0 6.6-5.4 12-12 12H12C5.4 96 0 90.6 0 84zm415.2 56.7L394.8 467c-1.6 25.3-22.6 45-47.9 45H101.1c-25.3 0-46.3-19.7-47.9-45L32.8 140.7c-.4-6.9 5.1-12.7 12-12.7h358.5c6.8 0 12.3 5.8 11.9 12.7z"
                    fill-rule="evenodd"
                  />
                </svg>
                <span class="sr-only">Delete {attachment.fileName}</span>
              </Button>
            </Show>
          </dd>
        )}
      </For>
    </dl>
  );
};
