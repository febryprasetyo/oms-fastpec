interface UserTableData {
  id: number;
  username: string;
  api_key: string;
  secret_key: string;
  nama_dinas: string;
}

interface UserResponse {
  success: boolean;
  data: {
    values: UserTableData[];
    total: string;
  };
  statusCode?: number;
}
