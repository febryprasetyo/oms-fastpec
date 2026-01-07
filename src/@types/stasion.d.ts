interface StationTableData {
  id: string;
  nama_stasiun: string;
  id_mesin: string;
  address: string;
  province_name: string;
  province_id: number;
  city_name: string;
  city_id: number;
}

interface StationResponse {
  success: boolean;
  statusCode?: number;
  data: {
    values: StationTableData[];
    total: number;
  };
}
interface DeviceData {
  device_id: string;
  nama_dinas: string;
  id_mesin: string;
}

interface DeviceResponse {
  success: boolean;
  statusCode?: number;
  data: DeviceData[];
}

interface ProvinceData {
  id: number;
  province_name: string;
}
interface ProvinceResponse {
  success: boolean;
  statusCode?: number;
  data: ProvinceData[];
}

interface CityData {
  id: number;
  city_name: string;
  province_id: number;
}

interface CityResponse {
  success: boolean;
  statusCode?: number;
  data: CityData[];
}

interface StationMonitoring {
  uuid: string;
  id_stasiun: string;
  status: string;
  address: string;
  minutesDiff: string;
  time: number;
}
