interface StasionData {
  id: string;
  nama_stasiun: string;
  id_mesin: string;
  address: string;
  province_name: string;
  province_id: number;
  city_name: string;
  city_id: number;
}

interface StasionTable {
  success: boolean;
  data: {
    values: StasionData[];
    total: string;
  };
}
