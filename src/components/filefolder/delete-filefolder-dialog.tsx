import { useApi } from "@/context/api-context.tsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Box, Modal, Typography, useTheme } from "@suid/material";
import { createSignal, Show } from "solid-js";
import { Button } from "../ui/button.tsx";
import { FileFolderProps } from "./file-folder-model.ts";

interface DeleteFileFolderProps extends FileFolderProps {
  callback: () => void;
}
export default function DeleteFileFolderDialog(props: DeleteFileFolderProps) {
  const api = useApi();
  const [open, setOpen] = createSignal(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const theme = useTheme();
  const handleSubmit = async () => {
    const res = await api.delete(`/responsehub/eventFolder/${props.fileFolder.folderId}`);
    console.log(res);
    props.callback();
  };
  return (
    <div>
      <Button variant="outline" onClick={handleOpen} size="sm">
        <i class="fa-solid fa-folder-minus" />
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
            Delete folder
          </Typography>
          <Show when={props}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              You are about to delete the folder {props?.fileFolder?.folderNameEn}.
            </Typography>
          </Show>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="default" onclick={handleSubmit}>
              Submit
            </Button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
