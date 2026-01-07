interface PengajuanInternetData {
  id: string | number;
  created_at: string;
  updated_at: string;
  tanggal: string;
  nama_paket: string;
  masa_aktif: number;
  harga: string;
  pic: string;
  station: string;
}

interface PengajuanListrikData {
  id: string | number;
  created_at: string;
  updated_at: string;
  tanggal: string;
  nama: string;
  kwh: number;
  harga: string;
  pic: string;
  station: string;
}

interface PengajuanInternetRequest {
  tanggal: string;
  nama_paket: string;
  masa_aktif: number;
  harga: string;
  pic: string;
  station: string;
}

interface PengajuanListrikRequest {
  tanggal: string;
  nama: string;
  kwh: number;
  harga: string;
  pic: string;
  station: string;
}

interface PengajuanResponse<T> {
  success: boolean;
  statusCode?: number;
  data: {
    values: T[];
    total: string;
  };
}
