interface Stasion {
  device_id: number;
  nama_dinas: string;
  id_mesin: number;
}

interface StasionList {
  success: boolean;
  data: Stasion[];
}
