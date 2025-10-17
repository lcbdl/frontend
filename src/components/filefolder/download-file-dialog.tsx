import "@fortawesome/fontawesome-free/css/all.min.css";
import { Box, Button, Modal, Typography, useTheme } from "@suid/material";
import axios, { AxiosProgressEvent } from "axios";
import { createSignal, Show } from "solid-js";
import { FileProps } from "./file-folder-model.ts";
import { LinearProgressWithLabel } from "./progressbar-withlabel.tsx";

export default function DownloadFileDialog(props: FileProps) {
  const [open, setOpen] = createSignal(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const theme = useTheme();
  const [progress, setProgress] = createSignal(10);
  const [isSuccess, setIsSuccess] = createSignal(false);
  const [clickedDownload, setClickedDownload] = createSignal(false);
  const handleDownload = async () => {
    setClickedDownload(true);
    //setIsLoading(true);
    await axios
      .get(`/downloadRequestorFile/${props.file.fileId}`, {
        responseType: "blob",
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total!) * 50;
          setProgress(progress);
        },
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = 50 + (progressEvent.loaded / progressEvent.total!) * 50;
          console.log(progress);
          setProgress(progress);
        },
      })
      .then((response) => {
        //console.log(response.data, response.status);
        if (response.status == 200) {
          setIsSuccess(true);
          //setData(response.data);
        } else {
          setIsSuccess(false);
        }
        //setIsLoading(false);
        setProgress(10);
      })
      .catch((error) => {
        setIsSuccess(false);
        //setIsLoading(false);
        setProgress(10);
      });
    setOpen(false);
  };
  return (
    <div>
      <i class="fa-solid fa-download" onClick={handleOpen} />
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
            Download file
          </Typography>
          <Show when={props}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              You are about to download the file {props?.file?.fileName}.
            </Typography>
          </Show>
          <Show when={clickedDownload()}>
            <Box marginY={3}>
              <LinearProgressWithLabel value={progress()} />
            </Box>
          </Show>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleDownload}>
              Download
            </Button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
