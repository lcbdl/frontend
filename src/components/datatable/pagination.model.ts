export interface TablePaginationProp {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (size: number) => void;
}
