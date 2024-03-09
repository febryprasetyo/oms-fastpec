interface payload {
  IDStasiun: string;
  Tanggal: string;
  Jam: string;
  Suhu: string;
  DHL: string;
  TDS: string;
  Salinitas: string;
  DO: string;
  PH: string;
  Turbidity: string;
  Kedalaman: string;
  SwSG: string;
  Nitrat: string;
  Amonia: string;
  ORP: string;
  COD: string;
  BOD: string;
  TSS: string;
}

interface DatabaseData {
  payload: string;
  api_key: string;
  api_secret: string;
}

interface DatabaseResponse {
  success: boolean;
  statusCode?: number;
  data: DatabaseData[];
}
