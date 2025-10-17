import { useApi } from "@/context/api-context.tsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Box, Button, Modal, Typography, useTheme } from "@suid/material";
import { createSignal, Show } from "solid-js";
import { FileProps } from "./file-folder-model.ts";
interface DeleteFileProps extends FileProps {
  callback: () => void;
}
export default function DeleteFileDialog(props: DeleteFileProps) {
  const api = useApi();
  const [open, setOpen] = createSignal(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const theme = useTheme();
  const handleDelete = async () => {
    await api.delete(`/requestorFile/${props.file.fileId}`);
    props.callback();
    setOpen(false);
  };
  return (
    <div>
      <i class="fa-solid fa-trash" onClick={handleOpen} />
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
            Delete file
          </Typography>
          <Show when={props}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              You are about to delete the file {props?.file?.fileName}.
            </Typography>
          </Show>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onclick={handleDelete}>
              Delete
            </Button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
