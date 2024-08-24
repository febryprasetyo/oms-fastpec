interface HistoryResponse {
  success: boolean;
  data: Payload[];
  totalData: string;
}

type Payload = {
  nama_stasiun: string;
  id: string;
  uuid: string;
  time: string;
  temperature: string;
  do_: string;
  tur: string;
  ct: string;
  ph: string;
  orp: string;
  bod: string;
  cod: string;
  tss: string;
  n: string;
  no3_3: string;
  no2: string;
  depth: string;
  lgnh4_plus: string | null;
  liquid: string | null;
};
