import { useApi } from "@/context/api-context";
import { useMutation } from "@tanstack/solid-query";
import axios, { AxiosProgressEvent, CancelTokenSource } from "axios";
import { Accessor, Component, createEffect, createSignal, For, Show } from "solid-js";
import { FileDownloadButton } from "./FileDownloadButton";

// Types
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  progress: number;
  status: "pending" | "scanning" | "completed" | "error" | "cancelled";
  scanResult?: FileScanResult;
  cancelToken?: CancelTokenSource;
}

interface FileScanResult {
  uuid: string;
  fileName: string;
  sha256: string;
  clean: boolean;
  scanTime: number;
  threats?: string[];
}

interface ScanResponse {
  scanResults: FileScanResult[];
}

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_CLIENT_PROCESSING_PERCENTAGE = 20; // Client processing: 0-20%
const MAX_UPLOAD_PERCENTAGE = 40; // Upload: 20-60%

// Utility functions
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase();
};

const getFileExtension = (fileName: string): string => {
  return fileName.substring(fileName.lastIndexOf(".") + 1).toUpperCase();
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

type FileUploadProps = {
  title?: string;
  subtitle?: string;
  onComplete?: (fileIds: string[]) => void;
  clearAllFilesTrigger?: Accessor<number>;
};

export const FileUpload: Component<FileUploadProps> = (props) => {
  const api = useApi();
  const [files, setFiles] = createSignal<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = createSignal(false);
  const [error, setError] = createSignal<string>("");

  createEffect(() => {
    if ((props.clearAllFilesTrigger?.() ?? 0) > 0) {
      setFiles([]);
      setError("");
    }
  });

  const isAllComplete = () =>
    files().every((f) => f.status === "completed" || f.status === "error" || f.status === "cancelled");

  createEffect(() => {
    if (isAllComplete()) {
      const cleanFileIds = files()
        .filter((f) => f.status === "completed" && f.scanResult?.clean)
        .map((f) => f.scanResult!.uuid);
      if (cleanFileIds.length > 0 && props.onComplete) {
        console.log("Calling onComplete with file IDs:", cleanFileIds);
        props.onComplete(cleanFileIds);
      }
    }
  });

  // File scanning mutation
  const scanFileMutation = useMutation(() => ({
    mutationFn: async ({ file, uploadedFile }: { file: File; uploadedFile: UploadedFile }) => {
      const formData = new FormData();
      formData.append("multipleFiles", file);

      const cancelToken = axios.CancelToken.source();

      // Update file with cancel token
      setFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, cancelToken, status: "scanning" as const } : f)),
      );

      try {
        // Step 1: Simulate client-side processing (0-20%)
        await simulateClientProcessing(uploadedFile.id);

        // Step 2: Actual server upload with progress (20-60%)
        const response = await api.post<ScanResponse>("/file/scanFile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          cancelToken: cancelToken.token,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              // Calculate upload progress within the 20-60% range
              const uploadProgressPercent = (progressEvent.loaded / progressEvent.total) * MAX_UPLOAD_PERCENTAGE;
              const totalProgress = MAX_CLIENT_PROCESSING_PERCENTAGE + uploadProgressPercent;

              setFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadedFile.id
                    ? {
                        ...f,
                        progress: Math.min(totalProgress, MAX_CLIENT_PROCESSING_PERCENTAGE + MAX_UPLOAD_PERCENTAGE),
                      }
                    : f,
                ),
              );
            }
          },
        });

        // Step 3: Simulate server processing/scanning (60-100%)
        await simulateServerProcessing(uploadedFile.id);

        return response.data;
      } catch (error) {
        if (axios.isCancel(error)) {
          throw new Error("Scan cancelled");
        }
        throw error;
      }
    },
    onSuccess: (data, { uploadedFile }) => {
      const scanResult = data.scanResults[0];
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                progress: 100,
                status: "completed" as const,
                scanResult,
              }
            : f,
        ),
      );
    },
    onError: (error, { uploadedFile }) => {
      const errorMessage = error instanceof Error ? error.message : "Scan failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: errorMessage.includes("cancelled") ? ("cancelled" as const) : ("error" as const),
              }
            : f,
        ),
      );
    },
  }));

  // Delete file mutation
  const deleteFileMutation = useMutation(() => ({
    mutationFn: async (uuid: string) => {
      await api.delete(`/file/${uuid}`);
    },
    onSuccess: (_, uuid) => {
      setFiles((prev) => prev.filter((f) => f.scanResult?.uuid !== uuid));
    },
  }));

  // Simulate client-side processing (0-20%)
  const simulateClientProcessing = async (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 3 + 1;
        if (progress >= MAX_CLIENT_PROCESSING_PERCENTAGE) {
          progress = MAX_CLIENT_PROCESSING_PERCENTAGE;
          clearInterval(interval);
          resolve();
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: Math.min(progress, MAX_CLIENT_PROCESSING_PERCENTAGE) } : f,
          ),
        );
      }, 100);
    });
  };

  // Simulate server processing/scanning (60-100%)
  const simulateServerProcessing = async (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      let progress = MAX_CLIENT_PROCESSING_PERCENTAGE + MAX_UPLOAD_PERCENTAGE; // Start at 60%
      const interval = setInterval(() => {
        progress += Math.random() * 2 + 0.5; // Slower increments for scanning
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }

        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f)));
      }, 200); // Slightly slower interval for scanning phase
    });
  };

  const handleFileSelect = (selectedFiles: FileList) => {
    setError("");
    const fileArray = Array.from(selectedFiles);

    // Calculate total size including existing files
    const existingSize = files().reduce((sum, f) => sum + f.size, 0);
    const newSize = fileArray.reduce((sum, f) => sum + f.size, 0);
    const totalSize = existingSize + newSize;

    if (totalSize > MAX_FILE_SIZE) {
      setError(`Total file size exceeds 50MB limit. Current: ${formatFileSize(totalSize)}`);
      return;
    }

    const newFiles: UploadedFile[] = fileArray.map((file) => ({
      id: generateId(),
      name: sanitizeFileName(file.name),
      size: file.size,
      type: file.type,
      file,
      progress: 0,
      status: "pending",
    }));

    // Add new files and start scanning
    setFiles((prev) => [...prev, ...newFiles]);

    for (let uploadedFile of newFiles) {
      try {
        scanFileMutation.mutate({ file: uploadedFile.file, uploadedFile });
      } catch (error) {
        // Error handling is already done in the mutation's onError callback
        console.log(`Scan failed for file: ${uploadedFile.name}`, error);
      }
    }
  };

  // Cancel file scan
  const cancelScan = (fileId: string) => {
    const file = files().find((f) => f.id === fileId);
    if (file?.cancelToken) {
      file.cancelToken.cancel("User cancelled");
    }
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "cancelled" as const } : f)));
  };

  // Remove file from list
  const removeFile = (fileId: string) => {
    const file = files().find((f) => f.id === fileId);

    if (file?.scanResult?.uuid) {
      deleteFileMutation.mutate(file.scanResult.uuid);
    } else {
      // Cancel ongoing scan if any
      if (file?.cancelToken) {
        file.cancelToken.cancel("File removed");
      }
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer?.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getProgressColor = (file: UploadedFile) => {
    if (file.status === "error") return "bg-red-500";
    if (file.status === "cancelled") return "bg-gray-400";
    if (file.scanResult && !file.scanResult.clean) return "bg-red-500";
    return "bg-green-500";
  };

  return (
    <div class="space-y-8">
      <div class="pt-8">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">{props.title}</h3>
          <p class="mt-1 text-sm text-gray-500">{props.subtitle}</p>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
          <div class="sm:col-span-6">
            <label for="upload-files" class="block text-sm font-medium text-nowrap text-gray-700">
              Upload files
            </label>
            {/* Upload Area */}
            <div
              class={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${
                isDragOver() ? "border-sky-600 bg-sky-50" : "border-gray-300"
              }`}
              id="upload-files"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div class="space-y-1 text-center">
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 640 512"
                  aria-hidden="true"
                >
                  <path
                    d="M312.5 168.5c-4.7-4.7-12.3-4.7-17 0l-98.3 98.3c-4.7 4.7-4.7 12.3 0 17l5.7 5.7c4.7 4.7 12.3 4.7 17 0l68.2-68.2V372c0 6.6 5.4 12 12 12h8c6.6 0 12-5.4 12-12V221.3l68.2 68.2c4.7 4.7 12.3 4.7 17 0l5.7-5.7c4.7-4.7 4.7-12.3 0-17l-98.5-98.3zm259.2 70.3c2.8-9.9 4.3-20.2 4.3-30.8 0-61.9-50.1-112-112-112-16.7 0-32.9 3.6-48 10.8-31.6-45-84.3-74.8-144-74.8-94.4 0-171.7 74.5-175.8 168.2C39.2 220.2 0 274.3 0 336c0 79.6 64.4 144 144 144h368c70.7 0 128-57.2 128-128 0-47-25.8-90.8-68.3-113.2zM512 448H144c-61.9 0-112-50.1-112-112 0-56.8 42.2-103.7 97-111-.7-5.6-1-11.3-1-17 0-79.5 64.5-144 144-144 60.3 0 111.9 37 133.4 89.6C420 137.9 440.8 128 464 128c44.2 0 80 35.8 80 80 0 18.5-6.3 35.6-16.9 49.2C573 264.4 608 304.1 608 352c0 53-43 96-96 96z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <div class="flex justify-center text-sm text-gray-600">
                  <label
                    for="file-upload"
                    class="relative cursor-pointer rounded-sm bg-white font-medium text-sky-700 focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 focus-within:outline-none hover:text-sky-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      class="sr-only"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileSelect(e.target.files);
                          e.target.value = ""; // Reset input
                        }
                      }}
                    />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">XLS, XLSX, CSV, PDF, PNG, JPG, GIF up to 50MB</p>
              </div>
            </div>

            {/* Error Message */}
            <Show when={error()}>
              <div class="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
                <div class="flex items-center">
                  <svg class="mr-2 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <p class="text-red-700">{error()}</p>
                </div>
              </div>
            </Show>

            {/* Files List */}
            <Show when={files().length > 0}>
              <div class="mt-6 rounded-md border border-gray-200 bg-gray-50 p-5 transition ease-in-out">
                <div class="flow-root">
                  <ul role="list" class="-my-5 divide-y divide-gray-200">
                    <For each={files()}>
                      {(file) => {
                        const fileExtension = getFileExtension(file.name);
                        return (
                          <li class="py-4">
                            {/* File info and button container */}
                            <div class="flex items-center space-x-4">
                              {/* File name and type container */}
                              <div class="min-w-0 flex-1">
                                <p class="truncate text-sm font-medium text-gray-900">{file.name}</p>
                                <p class="truncate text-xs text-gray-500">{fileExtension}</p>
                              </div>
                              {/* END File name and type container */}

                              <div class="flex flex-col sm:flex-row">
                                {/* View File Link: Only visible once file has been uploaded 100% */}
                                <Show when={file.status === "completed" && file.scanResult?.clean}>
                                  <div class="order-2 text-right sm:order-1">
                                    <FileDownloadButton fileId={file.scanResult!.uuid}>
                                      View uploaded file
                                    </FileDownloadButton>
                                  </div>
                                </Show>

                                {/* Malicious File Warning */}
                                <Show when={file.scanResult && !file.scanResult.clean}>
                                  <div class="order-2 text-right sm:order-1">
                                    <div class="inline-flex items-center rounded-sm border border-yellow-400 bg-yellow-400 px-2.5 py-0.5 text-sm leading-5 font-medium text-gray-900 shadow-sm transition ease-in-out">
                                      <svg
                                        aria-hidden="true"
                                        data-prefix="fas"
                                        data-icon="exclamation-triangle"
                                        role="img"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 576 512"
                                        class="mr-2 h-4 w-4 text-gray-900"
                                      >
                                        <path
                                          fill="currentColor"
                                          d="M569.5 440c18.5 32  -5.7 72-42.6 72H48c-36.9 0-60-40-41.6-72L246.4 24c18.5-32 64.7-32 83.2 0l239.9 416zM288 354c-25.4 0-46 20.6-46 46s20.6 46 46 46 46-20.6 46-46-20.6-46-46-46zm-43.7-165.3 7.4 136c.3 6.4 5.6 11.3 12 11.3h48.5c6.4 0 11.6-5 12-11.3l7.4-136c.4-6.9-5.1-12.7-12-12.7h-63.4c-6.9 0-12.4 5.8-12 12.7z"
                                        />
                                      </svg>
                                      Malicious file detected!
                                    </div>
                                  </div>
                                </Show>

                                {/* Cancel/Remove Buttons */}
                                <div class="order-1 mb-1 text-right sm:order-2 sm:mb-0 sm:ml-2">
                                  <Show when={file.status === "pending" || file.status === "scanning"}>
                                    <button
                                      onClick={() => cancelScan(file.id)}
                                      class="inline-flex items-center rounded-full border border-red-700 bg-white px-2.5 py-0.5 text-sm leading-5 font-medium text-red-700 shadow-sm transition ease-in-out hover:bg-red-700 hover:text-white focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-none"
                                    >
                                      <svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 352 512">
                                        <path
                                          fill-rule="evenodd"
                                          clip-rule="evenodd"
                                          d="M193.9 256L296.5 153.4c3.1-3.1 3.1-8.2 0-11.3l-22.6-22.6c-3.1-3.1-8.2-3.1-11.3 0L160 222.1 36.3 98.3c-3.1-3.1-8.2-3.1-11.3 0L2.3 121c-3.1 3.1-3.1 8.2 0 11.3L126.1 256 2.3 379.7c-3.1 3.1-3.1 8.2 0 11.3l22.6 22.6c3.1 3.1 8.2 3.1 11.3 0L160 289.9l102.6 102.6c3.1 3.1 8.2 3.1 11.3 0l22.6-22.6c3.1-3.1 3.1-8.2 0-11.3L193.9 256z"
                                        />
                                      </svg>
                                      Cancel upload
                                    </button>
                                  </Show>
                                  <Show when={file.status !== "pending" && file.status !== "scanning"}>
                                    <button
                                      onClick={() => removeFile(file.id)}
                                      disabled={deleteFileMutation.isPending}
                                      class="inline-flex items-center rounded-full border border-red-700 bg-white px-2.5 py-0.5 text-sm leading-5 font-medium text-red-700 shadow-sm transition ease-in-out hover:bg-red-700 hover:text-white focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-none"
                                    >
                                      Remove file
                                    </button>
                                  </Show>
                                </div>
                              </div>
                            </div>
                            {/* END File info and button container */}

                            {/* Progress Bar */}
                            <div class="flex flex-col transition ease-in-out">
                              <Show when={file.status === "pending" || file.status === "scanning"}>
                                <div class="mt-2">
                                  <div class="h-3 w-full rounded-full bg-gray-200">
                                    <div
                                      style={{ width: `${file.progress}%` }}
                                      class={`h-3 rounded-full transition ease-in-out ${getProgressColor(file)}`}
                                    />
                                  </div>
                                  <div class="mt-1 text-right text-sm text-gray-600">
                                    <span class="font-semibold">{Math.round(file.progress)}%</span> Uploaded
                                  </div>
                                </div>
                              </Show>

                              <Show when={file.status === "cancelled"}>
                                <div class="mt-2">
                                  <div class="h-3 w-full rounded-full bg-gray-200">
                                    <div
                                      class="h-3 rounded-full bg-red-600 transition ease-in-out"
                                      style={{ width: "0%" }}
                                    />
                                  </div>
                                  <div class="mt-1 text-right text-sm text-gray-600">
                                    <span class="font-semibold">Upload cancelled</span>
                                  </div>
                                </div>
                              </Show>

                              <Show when={file.status === "error"}>
                                <div class="mt-2">
                                  <div class="h-3 w-full rounded-full bg-gray-200">
                                    <div
                                      class="h-3 rounded-full bg-red-600 transition ease-in-out"
                                      style={{ width: "100%" }}
                                    />
                                  </div>
                                  <div class="mt-1 text-right text-sm text-gray-600">
                                    <span class="font-semibold">Scan failed</span>
                                  </div>
                                </div>
                              </Show>
                            </div>
                            {/* END Progress Bar */}
                          </li>
                        );
                      }}
                    </For>
                  </ul>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};
