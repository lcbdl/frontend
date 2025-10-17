import { Box, FormControl, InputLabel, MenuItem, Pagination, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select/index.js";
import { createSignal } from "solid-js";
import { TablePaginationProp } from "./pagination.model.ts";

export default function TablePagination(props: TablePaginationProp) {
  const [pageSize, setPageSize] = createSignal(5);

  const handlePageSizeChange = (event: SelectChangeEvent) => {
    var size = parseInt(event.target.value as string, 10);
    setPageSize(size);
    props.onRowsPerPageChange(size);
  };

  function handlePage(event: any, value: number): void {
    props.onPageChange(value);
  }

  return (
    <>
      <Box sx={{ minWidth: 120 }}>
        <InputLabel for="simple-select-label">Page size</InputLabel>
        <FormControl fullWidth>
          <Select
            size="small"
            labelId="simple-select-label"
            id="simple-select"
            value={pageSize()}
            label="Page size"
            onChange={handlePageSizeChange}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={30}>30</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Pagination
        sx={{ width: "100%", paddingTop: "20px" }}
        color="primary"
        count={props.totalPages}
        onChange={handlePage}
        page={props.currentPage}
      />
    </>
  );
}
