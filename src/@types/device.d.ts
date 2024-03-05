interface deviceData {
  device_id: number;
  nama_dinas: string;
  id_mesin: string;
}

interface Device {
  success: boolean;
  data: deviceData[];
}
