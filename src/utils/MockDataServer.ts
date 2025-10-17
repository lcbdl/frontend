// mock-server.ts

import { QueryParams } from "@/components/ui/table/DataTable";
import { delay } from "./common-utils";

export interface MockDeliverySite {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  status: "Active" | "Offline";
  siteNumber: string;
  feature: string;
  price: number;
}

const MOCK_DATA: MockDeliverySite[] = Array.from({ length: 200 }, (_, i) => ({
  id: `site-${i + 1}`,
  name: `Location ${i + 1}`,
  address: `${100 + i} Main St`,
  city: ["Toronto", "Vancouver", "Calgary", "Montreal", "Ottawa"][i % 5],
  province: ["ON", "BC", "AB", "QC", "ON"][i % 5],
  postalCode: `A1A ${String(100 + i).slice(-3)}`,
  status: i % 3 === 0 ? "Offline" : "Active",
  siteNumber: `SN${1000 + i}`,
  feature: ["Drive-Thru", "24/7", "EV Charging", "Play Place", "WiFi"][i % 5],
  price: 200 + (i % 10) * 50 + (i % 7) * 10,
}));

export async function fetchAllTableData(): Promise<{
  rows: MockDeliverySite[];
  totalRows: number;
}> {
  delay(300);
  return { rows: MOCK_DATA, totalRows: MOCK_DATA.length };
}

export async function fetchTableData(query: QueryParams<MockDeliverySite>): Promise<{
  rows: MockDeliverySite[];
  totalRows: number;
}> {
  let result = [...MOCK_DATA];
  const { pageIndex, pageSize, sortBy = [], filters = [], globalFilter = "" } = query;

  // 1. Apply Global Filter
  if (globalFilter && globalFilter.length > 0) {
    const gf = globalFilter.toLowerCase();
    result = result.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(gf)));
  }

  // 2. Column Filters
  for (const filter of filters) {
    result = result.filter((row) => String(row[filter.id]).toLowerCase().includes(String(filter.value).toLowerCase()));
  }

  // 3. Sorting
  for (const sort of sortBy.reverse()) {
    result.sort((a, b) => {
      const aVal = a[sort.id];
      const bVal = b[sort.id];
      if (aVal < bVal) return sort.desc ? 1 : -1;
      if (aVal > bVal) return sort.desc ? -1 : 1;
      return 0;
    });
  }

  const totalRows = result.length;

  // 4. Pagination
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  const paginated = result.slice(start, end);

  await new Promise((r) => setTimeout(r, 300)); // simulate delay
  console.log("fetch API data", query);
  return { rows: paginated, totalRows };
}
