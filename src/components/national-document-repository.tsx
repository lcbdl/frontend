import { useApi } from "@/context/api-context.tsx";
import i18n from "@/i18n/index.ts";
import { Component, createSignal, onMount, Show } from "solid-js";
import { FileFolderRoot } from "./filefolder/file-folder-model.ts";
import FileFolderView from "./filefolder/file-folder-view.tsx";

const NationalDocumentRepository: Component = () => {
  const emptyFolders: FileFolderRoot = { childFolders: [] };
  const [folders, setFolders] = createSignal(emptyFolders);
  const [isReady, setIsReady] = createSignal(false);
  const { get } = useApi();

  onMount(async () => {
    const rootFolder = await get<FileFolderRoot>("/fileFolders");
    setFolders(rootFolder);
    setIsReady(true);
  });

  const handleRefresh = async () => {
    const rootFolder = await get<FileFolderRoot>("/fileFolders");
    setFolders(rootFolder);
  };

  return (
    <>
      <h2 class="bg-blue-400 font-bold text-white">{i18n.t("title")}</h2>
      <Show when={isReady()} fallback={<p>Loading...</p>}>
        <FileFolderView callback={handleRefresh} folders={folders()} />
      </Show>
    </>
  );
};

export default NationalDocumentRepository;
