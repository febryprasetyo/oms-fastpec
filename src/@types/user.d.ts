interface UserData {
  id: number;
  username: string;
  api_key: string;
  secret_key: string;
  nama_dinas: string;
}

interface UserResponse {
  success: boolean;
  data: {
    values: UserData[];
    total: string;
  };
  statusCode?: number;
}
