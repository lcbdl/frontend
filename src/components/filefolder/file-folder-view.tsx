import { useApi } from "@/context/api-context.tsx";
import i18n from "@/i18n/index.ts";
import "@fortawesome/fontawesome-free/css/all.min.css";
import {
  Box,
  Button,
  Divider,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  Typography,
} from "@suid/material";
import { createSignal, For, onMount, Show } from "solid-js";
import DataTable from "../datatable/file-datatable.tsx";
import AddFileDialog from "./add-file-dialog.tsx";
import AddFileFolderDialog from "./add-filefolder-dialog.tsx";
import DeleteFileFolderDialog from "./delete-filefolder-dialog.tsx";
import { FileFolderDetails, FileFolderRootProps } from "./file-folder-model.ts";
import "./file-folder-view.css";

const FileFolderView = (props: FileFolderRootProps) => {
  const defaultFolder: FileFolderDetails = { folderId: 0, files: [] };
  const [currentFolder, setCurrentFolder] = createSignal(defaultFolder);
  const [ready, setReady] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  const api = useApi();

  onMount(() => {
    console.log("props", props);
  });
  const handleAddFolder = () => {
    props.callback();
  };
  const handleDeleteFolder = () => {
    props.callback();
  };
  const handleAddFile = () => {
    props.callback();
  };
  const handleDeleteFile = () => {
    props.callback();
    handleFolder(currentFolder().folderId, null);
  };
  const handleFolder = async (folderId: number, event) => {
    setOpen(true);
    setReady(false);
    console.log(event, folderId);
    const res = await api.get<FileFolderDetails>(`/fileFolder/${folderId}`);
    if (res.status === 200) {
      setCurrentFolder(res.data);
      setReady(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <h3>
        {i18n.t("folder.root")} {`(${props.folders.childFolders.length} folders)`}
      </h3>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <AddFileFolderDialog fileFolder={defaultFolder} callback={handleAddFolder}>
            New root folder
          </AddFileFolderDialog>
        </Box>
        <nav>
          <List disablePadding>
            <For each={props.folders.childFolders}>
              {(folder) => (
                <ListItem
                  disablePadding
                  sx={{
                    display: "list-item",
                    border: "solid",
                    marginBottom: "5px",
                    borderWidth: "thin",
                  }}
                >
                  <ListItemButton>
                    <ListItemIcon>
                      <i class="fa-solid fa-folder-closed" />
                    </ListItemIcon>
                    <ListItemText
                      primary={folder.folderNameEn}
                      secondary={
                        <>
                          <span>{folder.childFolders.length} subfolders and </span>
                          <Show when={folder.fileNumber > 0}>
                            <Link onClick={[handleFolder, folder.folderId, folder.folderNameEn]} href="#">
                              {folder.fileNumber} files
                            </Link>
                          </Show>
                          <Show when={folder.fileNumber == 0}>
                            <span>{folder.fileNumber} files</span>
                          </Show>
                        </>
                      }
                    />
                    <AddFileFolderDialog fileFolder={folder} callback={handleAddFolder}>
                      New
                    </AddFileFolderDialog>
                    <Show when={folder.childFolders.length == 0 && folder.fileNumber == 0}>
                      <DeleteFileFolderDialog fileFolder={folder} callback={handleDeleteFolder}>
                        Delete
                      </DeleteFileFolderDialog>
                    </Show>
                    <AddFileDialog fileFolder={folder} callback={handleAddFile}>
                      Upload
                    </AddFileDialog>
                  </ListItemButton>
                  <nav>
                    <List disablePadding>
                      <For each={folder.childFolders}>
                        {(subfolder) => (
                          <ListItem
                            disablePadding
                            sx={{
                              display: "list-item",
                              paddingLeft: "40px",
                            }}
                          >
                            <ListItemButton>
                              <ListItemIcon>
                                <FolderSpecialOutlined />
                              </ListItemIcon>
                              <ListItemText
                                primary={subfolder.folderNameEn}
                                secondary={
                                  <>
                                    <span>{subfolder.childFolders.length} subfolders and </span>
                                    <Show when={subfolder.fileNumber > 0}>
                                      <Link
                                        onClick={[handleFolder, subfolder.folderId, subfolder.folderNameEn]}
                                        href="#"
                                      >
                                        {subfolder.fileNumber} files
                                      </Link>
                                    </Show>
                                    <Show when={subfolder.fileNumber == 0}>
                                      <span>{subfolder.fileNumber} files</span>
                                    </Show>
                                  </>
                                }
                              />
                              <AddFileFolderDialog fileFolder={subfolder} callback={handleAddFolder}>
                                New
                              </AddFileFolderDialog>
                              <Show when={subfolder.childFolders.length == 0 && subfolder.fileNumber == 0}>
                                <DeleteFileFolderDialog fileFolder={subfolder} callback={handleDeleteFolder}>
                                  Delete
                                </DeleteFileFolderDialog>
                              </Show>
                              <AddFileDialog fileFolder={subfolder} callback={handleAddFile}>
                                Upload
                              </AddFileDialog>
                            </ListItemButton>
                            <nav>
                              <List disablePadding dense>
                                <For each={subfolder.childFolders}>
                                  {(subfolder2) => (
                                    <ListItem
                                      disablePadding
                                      sx={{
                                        display: "list-item",
                                        paddingLeft: "80px",
                                      }}
                                    >
                                      <ListItemButton>
                                        <ListItemIcon>
                                          <FolderSpecialOutlined />
                                        </ListItemIcon>
                                        <ListItemText
                                          primary={subfolder2.folderNameEn}
                                          secondary={
                                            <>
                                              <span>{subfolder2.childFolders.length} subfolders and </span>
                                              <Show when={subfolder2.fileNumber > 0}>
                                                {" "}
                                                <Link
                                                  onClick={[handleFolder, subfolder2.folderId, subfolder2.folderNameEn]}
                                                  href="#"
                                                >
                                                  {subfolder2.fileNumber} files
                                                </Link>
                                              </Show>
                                              <Show when={subfolder2.fileNumber == 0}>
                                                <span>{subfolder2.fileNumber} files</span>
                                              </Show>
                                            </>
                                          }
                                        />
                                        <Show when={subfolder2.childFolders.length == 0 && subfolder2.fileNumber == 0}>
                                          <DeleteFileFolderDialog callback={handleDeleteFolder} fileFolder={subfolder2}>
                                            Delete
                                          </DeleteFileFolderDialog>
                                        </Show>
                                        <AddFileDialog fileFolder={subfolder2} callback={handleAddFile}>
                                          Upload
                                        </AddFileDialog>
                                      </ListItemButton>
                                    </ListItem>
                                  )}
                                </For>
                              </List>
                            </nav>
                          </ListItem>
                        )}
                      </For>
                    </List>
                  </nav>
                </ListItem>
              )}
            </For>
          </List>
        </nav>
      </Box>
      <Divider />

      <Modal
        keepMounted={false}
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
            backgroundColor: "white",
            border: "2px solid #000",
            boxShadow: "24px",
            p: 4,
            overflow: "scroll",
          }}
        >
          <Show when={ready()} fallback={<p>loading</p>}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              {currentFolder().folderName} Files
            </Typography>

            <DataTable rows={currentFolder().files} callback={handleDeleteFile} />

            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <Button size="small" variant="contained" onClick={handleClose}>
                Close
              </Button>
            </Typography>
          </Show>
        </Box>
      </Modal>
    </>
  );
};

export default FileFolderView;
