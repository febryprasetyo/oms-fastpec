interface InventoryTableData {
  id: string;
  products: string;
  serial_number: string;
  condition: string;
  date_in: string;
  date_out: string;
}

interface InventoryResponse {
  total: number;
  page: number;
  per_page: number;
  sort_by: string;
  sort_order: string;
  success: boolean;
  data: {
    values: InventoryTableData[];
    total: string;
  };
  statusCode?: number;
}
