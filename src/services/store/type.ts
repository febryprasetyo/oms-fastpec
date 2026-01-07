export type TAuthStore = {
  user: TAuthResponse | null;
  doLogin: (arg: { username: string; password: string }) => Promise<void>;
  doLogout: () => void;
};

export type KlhkListResponse = {
  data: any[]; // Ganti dengan struktur data sebenarnya
  totalData: number;
  // Tambahkan properti lain sesuai respons API
};
