import { useApi } from "@/context/api-context.tsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Box, InputLabel, MenuItem, Modal, Select, Stack, TextField, Typography, useTheme } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select/index.js";
import { HttpStatusCode } from "axios";
import { createSignal, For, InitializedResource, Show } from "solid-js";
import { Button } from "../ui/button.tsx";
import { FileFolderForm, FileFolderProps, FolderType } from "./file-folder-model.ts";
export interface AddFileFolderProps extends FileFolderProps {
  callback: () => void;
  folderTypes: InitializedResource<FolderType[]>;
}
export default function AddFileFolderDialog(props: AddFileFolderProps) {
  const api = useApi();
  const [open, setOpen] = createSignal(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const theme = useTheme();
  const [folderNameEn, setFolderNameEn] = createSignal("");
  const [folderNameFr, setFolderNameFr] = createSignal("");
  const [folderStatus, setFolderStatus] = createSignal(0);
  const [folderType, setFolderType] = createSignal(0);

  const handleFolderStatus = (event: SelectChangeEvent) => {
    var status = parseInt(event.target.value as string, 10);
    setFolderStatus(status);
  };
  const handleFolderType = (event: SelectChangeEvent) => {
    var type = parseInt(event.target.value as string, 10);
    setFolderType(type);
  };
  const handleFolderNameEn = (event: SelectChangeEvent) => {
    var name = event.target.value as string;
    setFolderNameEn(name);
  };
  const handleFolderNameFr = (event: SelectChangeEvent) => {
    var name = event.target.value as string;
    setFolderNameFr(name);
  };
  const handleSubmit = async () => {
    let form: FileFolderForm = {
      folderNameEn: folderNameEn(),
      folderNameFr: folderNameFr(),
      parentFolderId: props.fileFolder?.folderId,
      folderTypeId: folderType(),
      status: folderStatus(),
    };
    const res = await api.post("/newfolder/", form);
    if (res.status === HttpStatusCode.Ok) {
      props.callback();
    }
    setOpen(false);
  };
  return (
    <div>
      <Button variant="outlined" onClick={handleOpen}>
        <i class="fa-solid fa-folder-plus" />
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
          <Show when={props.fileFolder.folderId !== 0}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Create a new folder under {props?.fileFolder?.folderNameEn}
            </Typography>
          </Show>
          <Show when={props.fileFolder.folderId == 0}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Create a new root folder
            </Typography>
          </Show>
          <Show when={props}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Enter folder details below, all fields with * are required.
            </Typography>
          </Show>
          <Box component="form" sx={{ paddingTop: "20px" }}>
            <Stack spacing={2}>
              <TextField
                size="small"
                id="folderNameEn"
                variant="outlined"
                value={folderNameEn()}
                label="Folder Name English *"
                onChange={handleFolderNameEn}
              />
              <TextField
                size="small"
                id="folderNameFr"
                variant="outlined"
                value={folderNameFr()}
                label="Folder Name French *"
                onChange={handleFolderNameFr}
              />
              <InputLabel for="folderStatus">Folder Status *</InputLabel>
              <Select
                size="small"
                id="folderStatus"
                value={folderStatus()}
                onChange={handleFolderStatus}
                label="Folder Status"
                variant="outlined"
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={2}>Archived</MenuItem>
              </Select>

              <Show when={!props.folderTypes.loading} fallback={<p>Loading...</p>}>
                <InputLabel for="folderType">Folder Type *</InputLabel>
                <Select
                  size="small"
                  id="folderType"
                  value={folderType()}
                  label="Folder Type"
                  onChange={handleFolderType}
                  inputProps={{ name: "Folder Type" }}
                >
                  <For each={props.folderTypes()}>
                    {(eve) => <MenuItem value={eve.folderTypeId}>{eve.folderTypeNameEng}</MenuItem>}
                  </For>
                </Select>
              </Show>
            </Stack>
          </Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="default" onClick={handleSubmit}>
              Add Folder
            </Button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
