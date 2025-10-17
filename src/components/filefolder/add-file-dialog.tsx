import "@fortawesome/fontawesome-free/css/all.min.css";
import { Box, Button, Modal, Typography, useTheme } from "@suid/material";
import axios, { AxiosProgressEvent } from "axios";
import { createSignal, Show } from "solid-js";
import { FileFolderProps, FileUploadResponse } from "./file-folder-model.ts";
import { LinearProgressWithLabel } from "./progressbar-withlabel.tsx";
interface AddFileProps extends FileFolderProps {
  callback: () => void;
}
export default function AddFileDialog(props: AddFileProps) {
  const [open, setOpen] = createSignal(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [progress, setProgress] = createSignal(10);
  const [isSuccess, setIsSuccess] = createSignal(false);
  const [clickedSubmit, setClickedSubmit] = createSignal(false);
  const theme = useTheme();
  const emptyFile: File = {
    lastModified: 0,
    name: "",
    webkitRelativePath: "",
    size: 0,
    type: "",
    arrayBuffer: function (): Promise<ArrayBuffer> {
      throw new Error("Function not implemented.");
    },
    bytes: function (): Promise<Uint8Array> {
      throw new Error("Function not implemented.");
    },
    slice: function (start?: number, end?: number, contentType?: string): Blob {
      throw new Error("Function not implemented.");
    },
    stream: function (): ReadableStream<Uint8Array> {
      throw new Error("Function not implemented.");
    },
    text: function (): Promise<string> {
      throw new Error("Function not implemented.");
    },
  };
  const [uploadedFile, setUploadedFile] = createSignal(emptyFile);

  const handleFile = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
  };

  const handleFileUpload = async () => {
    setClickedSubmit(true);
    const formData = new FormData();
    formData.append("files", uploadedFile());
    formData.append("fileFolderId", props.fileFolder.folderId.toString());
    await axios
      .post("/uploadRequestorFile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total!) * 50;
          setProgress(progress);
        },
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = 50 + (progressEvent.loaded / progressEvent.total!) * 50;
          //console.log(progress);
          setProgress(progress);
        },
      })
      .then((response) => {
        console.log(response.data, response.status);
        if (response.status == 200) {
          const result: FileUploadResponse = response.data[0];
          if (result.saved) {
            setIsSuccess(true);
            //setData(result)
          } else {
            setIsSuccess(false);
          }
        } else {
          setIsSuccess(false);
        }
        //setIsLoading(false)
        setProgress(10);
      })
      .catch((error) => {
        setIsSuccess(false);
        //setIsLoading(false)
        setProgress(10);
      });

    props.callback();
    setOpen(false);
  };
  return (
    <div>
      <Button variant="outline" onClick={handleOpen} size="sm">
        <i class="fa-solid fa-paperclip" />
        {props.children}
      </Button>
      <Modal
        open={open()}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: theme.palette.background.paper,
            border: "2px solid #000",
            boxShadow: "24px",
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Upload a new file
          </Typography>
          <Show when={props}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              You are about to upload a new file under {props?.fileFolder?.folderNameEn}.
              <Show when={clickedSubmit()}>
                <Box marginY={3}>
                  <LinearProgressWithLabel value={progress()} />
                </Box>
              </Show>
              <input type="file" accept="xlsx, xls" multiple={false} onChange={(e) => handleFile(e)} />
            </Typography>
          </Show>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onclick={handleFileUpload}>
              Upload
            </Button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
