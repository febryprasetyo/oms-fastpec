interface HistoryResponse {
  success: boolean;
  data: Payload[];
  totalData: string;
}

type Payload = {
  [x: string]: ReactNode;
  nama_stasiun: string;
  id: string;
  uuid: string;
  time: string;
  temperature: string;
  DO: string;
  TUR: string;
  TDS: string;
  PH: string;
  ORP: string;
  BOD: string;
  COD: string;
  TSS: string;
  Amonia: string;
  NO3: string;
  NO2: string;
  Depth: string;
  lgnh4_plus: string | null;
  liquid: string | null;
};
