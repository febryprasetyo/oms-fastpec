interface CityData {
  id: 1101;
  city_name: string;
  province_id: number;
}

interface City {
  success: boolean;
  data: CityData[];
}
