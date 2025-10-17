export interface FileFolder {
  folderId: number;
  parentFolderId: number;
  folderNameEn: string;
  folderNameFr: string;
  childFolders: FileFolder[];
  leaf: boolean;
  fileNumber: number;
}

export interface FileFolderRoot {
  childFolders: FileFolder[];
}

export interface FileFolderRootProps {
  folders: FileFolderRoot;
  callback: () => void;
}

export interface FileFolderProps {
  fileFolder: FileFolder;
  children?: string;
}
export interface FileDetails {
  fileId: number;
  fileName: string;
  fileType: string;
  owner: string;
}

export interface FileProps {
  file: FileDetails;
  children?: string;
}

export interface FileFolderDetails {
  folderId: number;
  folderName?: string;
  files: FileDetails[];
}

export interface FolderType {
  folderTypeId: number;
  folderTypeNameEng: string;
  folderTypeNameFrc: string;
  folderIcon: string;
}

export interface FileFolderForm {
  folderId?: number;
  parentFolderId?: number;
  folderNameEn: string;
  folderNameFr: string;
  folderTypeId: number;
  status: number;
}

export interface FileUploadResponse {
  id: string;
  fileName?: string;
  message?: string;
  saved?: boolean;
}
