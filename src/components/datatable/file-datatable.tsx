import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from "@suid/material";
import { createEffect, createSignal, For } from "solid-js";
import DeleteFileDialog from "../filefolder/delete-file-dialog.tsx";
import DownloadFileDialog from "../filefolder/download-file-dialog.tsx";
import { FileDetails } from "../filefolder/file-folder-model.ts";
import TablePagination from "./pagination.tsx";
export interface DataTableProp {
  rows: FileDetails[];
  callback: () => void;
}
export default function DataTable(props: DataTableProp) {
  const [page, setPage] = createSignal(1);
  const [rowsPerPage, setRowsPerPage] = createSignal(5);
  const [totalPages, setTotalPages] = createSignal(0);

  createEffect(() => {
    setTotalPages(Math.ceil(props.rows.length / rowsPerPage()));
  });

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (size: number) => {
    setRowsPerPage(size);
    setPage(1);
  };

  const handleDelete = () => {
    props.callback();
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: "100%" }} aria-label="responsehub table">
        <TableHead>
          <TableRow>
            <TableCell>File Name</TableCell>
            <TableCell>FileType</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <For
            each={
              rowsPerPage() > 0 ? props.rows.slice((page() - 1) * rowsPerPage(), page() * rowsPerPage()) : props.rows
            }
          >
            {(row) => (
              <TableRow>
                <TableCell>{row.fileName}</TableCell>
                <TableCell>{row.fileType}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex" }}>
                    <DownloadFileDialog file={row} />
                    <DeleteFileDialog file={row} callback={handleDelete} />
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </For>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colspan="4">
              <TablePagination
                currentPage={page()}
                totalPages={totalPages()}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
