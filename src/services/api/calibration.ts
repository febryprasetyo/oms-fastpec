import { calibrationParameterConfigs, getCalibrationParameterConfig } from "@/config/calibration-parameters";
import { axiosInstance } from "@/lib/axiosInstance";
import {
  CreateCalibrationDraftPayloadSchema,
  UpdateCalibrationPayloadSchema,
  type CreateCalibrationDraftPayload,
  type UpdateCalibrationPayload,
} from "@/schemas/calibration-api.schema";
import type {
  Calibration,
  CalibrationApiDetail,
  CalibrationApiStatus,
  CalibrationApiWaterSample,
  CalibrationDetail,
  Parameter,
  Station,
  WaterSample,
} from "@/types/calibration";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
}

interface ApiCalibrationRecord {
  id: string;
  report_no: string;
  station_id: number;
  station_name?: string;
  station_address?: string;
  station_coordinate?: string;
  calibration_date: string;
  contact_person: string;
  phone: string;
  officer_name?: string;
  status: CalibrationApiStatus;
  notes?: string | null;
  verification_uuid?: string;
  created_at: string;
  updated_at: string;
  details?: CalibrationApiDetail[];
  waterSamples?: CalibrationApiWaterSample[];
}

interface StationListItem {
  id?: number | string;
  id_stasiun?: number | string;
  uuid?: string;
  nama_stasiun?: string;
  name?: string;
  address?: string;
  lokasi?: string;
  latitude?: number | string;
  longitude?: number | string;
}

const authHeaders = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

const displayStatus = (status: CalibrationApiStatus): Calibration["status"] =>
  status.charAt(0).toUpperCase().concat(status.slice(1)) as Calibration["status"];

const parseCoordinate = (coordinate?: string) => {
  const values = coordinate?.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return { latitude: values[0] ?? 0, longitude: values[1] ?? 0 };
};

const parseCoefficients = (coefficients: CalibrationApiDetail["coefficients"]): Record<string, number> => {
  if (!coefficients) return {};

  if (typeof coefficients === "string") {
    try {
      const parsed = JSON.parse(coefficients) as Record<string, number>;
      return parsed;
    } catch {
      return {};
    }
  }

  return coefficients;
};

const toParameter = (parameterId: string, parameterName?: string): Parameter => {
  const config = getCalibrationParameterConfig(parameterId);
  const spec = config?.standards
    .map((standard) => `${standard.minAcceptable}-${standard.maxAcceptable} ${config.unit}`)
    .join(" | ") ?? "";

  return { id: parameterId, name: parameterName ?? config?.name ?? "", spec };
};

const mapWaterSample = (sample: CalibrationApiWaterSample): WaterSample => ({
  id: String(sample.id ?? ""),
  sampleName: sample.sample_name,
  temperature: sample.suhu ?? undefined,
  ph: sample.ph ?? undefined,
  doValue: sample.do ?? undefined,
  conductivity: undefined,
  tds: sample.tds ?? undefined,
  salinity: undefined,
  turbidity: sample.tur ?? undefined,
  cod: sample.cod ?? undefined,
  bod: sample.bod ?? undefined,
  tss: sample.tss ?? undefined,
  nh3: sample.amonia ?? undefined,
  no3: sample.nitrat ?? undefined,
  orp: sample.orp ?? undefined,
});

const mapCalibration = (calibration: ApiCalibrationRecord): Calibration => {
  const coordinate = parseCoordinate(calibration.station_coordinate);

  return {
    id: calibration.id,
    reportNo: calibration.report_no,
    stationId: String(calibration.station_id),
    stationName: calibration.station_name ?? "",
    address: calibration.station_address ?? "",
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    calibrationDate: calibration.calibration_date,
    contactPerson: calibration.contact_person,
    phone: calibration.phone,
    officer: calibration.officer_name ?? "",
    status: displayStatus(calibration.status),
    createdAt: calibration.created_at,
    updatedAt: calibration.updated_at,
    verificationUrl: calibration.verification_uuid ? `/verify/${calibration.verification_uuid}` : undefined,
    uuid: calibration.verification_uuid,
  };
};

export const mapCalibrationDetail = (calibration: ApiCalibrationRecord): CalibrationDetail => ({
  ...mapCalibration(calibration),
  parameters: (calibration.details ?? []).map((detail) => {
    const parameter = toParameter(String(detail.parameter_id), detail.parameter_name);
    const coefficients = parseCoefficients(detail.coefficients);

    return {
      id: detail.id,
      parameterId: parameter.id,
      parameterName: parameter.name,
      spec: parameter.spec,
      coeffType: detail.coeff_type ?? undefined,
      remark: detail.remark,
      results: detail.standards.map((standard) => ({
        id: standard.id,
        standardName: standard.crm_name,
        standardValue: standard.crm_standard_value,
        minAcceptable: standard.min_acceptable,
        maxAcceptable: standard.max_acceptable,
        value: standard.calibration_result?.toString() ?? "",
      })),
      coefficients: Object.entries(coefficients).map(([key, value]) => ({ key, value })),
      status: detail.calculation_result,
    };
  }),
  waterSamples: (calibration.waterSamples ?? []).map(mapWaterSample),
  notes: calibration.notes ?? "",
});

export const calibrationService = {
  async getStations(accessToken: string): Promise<Station[]> {
    const response = await axiosInstance.post<ApiResponse<{ list: StationListItem[] }>>(
      "/api/data/station/list",
      { limit: 100, offset: 0 },
      { headers: authHeaders(accessToken) },
    );

    return response.data.data.list.map((station) => ({
      id: String(station.id ?? station.id_stasiun ?? station.uuid ?? ""),
      name: station.nama_stasiun ?? station.name ?? "",
      address: station.address ?? station.lokasi ?? "",
      latitude: Number(station.latitude ?? 0),
      longitude: Number(station.longitude ?? 0),
    }));
  },

  async getMasterParameters(): Promise<Parameter[]> {
    return calibrationParameterConfigs.map((config) => toParameter(config.id, config.name));
  },

  async getCalibrations(accessToken: string): Promise<Calibration[]> {
    const response = await axiosInstance.get<ApiResponse<ApiCalibrationRecord[]>>("/api/calibrations", {
      headers: authHeaders(accessToken),
    });

    return response.data.data.map(mapCalibration);
  },

  async getCalibrationById(id: string, accessToken: string): Promise<CalibrationDetail> {
    const response = await axiosInstance.get<ApiResponse<ApiCalibrationRecord>>(`/api/calibrations/${id}`, {
      headers: authHeaders(accessToken),
    });

    return mapCalibrationDetail(response.data.data);
  },

  async getCalibrationByUuid(uuid: string): Promise<CalibrationDetail> {
    const response = await axiosInstance.get<ApiResponse<ApiCalibrationRecord>>(`/api/verify/${uuid}`);
    return mapCalibrationDetail(response.data.data);
  },

  async createCalibration(data: unknown, accessToken: string): Promise<Calibration> {
    const payload: CreateCalibrationDraftPayload = CreateCalibrationDraftPayloadSchema.parse(data);
    const response = await axiosInstance.post<ApiResponse<ApiCalibrationRecord>>("/api/calibrations", payload, {
      headers: authHeaders(accessToken),
    });

    return mapCalibration(response.data.data);
  },

  async updateCalibration(id: string, data: unknown, accessToken: string): Promise<Calibration> {
    const payload: UpdateCalibrationPayload = UpdateCalibrationPayloadSchema.parse(data);
    const response = await axiosInstance.put<ApiResponse<ApiCalibrationRecord>>(`/api/calibrations/${id}`, payload, {
      headers: authHeaders(accessToken),
    });

    return mapCalibration(response.data.data);
  },

  async submitCalibration(id: string, accessToken: string): Promise<void> {
    await axiosInstance.post(`/api/calibrations/${id}/submit`, {}, { headers: authHeaders(accessToken) });
  },

  async deleteCalibration(id: string, accessToken: string): Promise<void> {
    await axiosInstance.delete(`/api/calibrations/${id}`, { headers: authHeaders(accessToken) });
  },

  async approveCalibration(id: string, accessToken: string): Promise<void> {
    await axiosInstance.post(`/api/calibrations/${id}/approve`, {}, { headers: authHeaders(accessToken) });
  },

  async downloadPdf(id: string, accessToken: string): Promise<Blob> {
    const response = await axiosInstance.get(`/api/calibrations/${id}/print`, {
      headers: authHeaders(accessToken),
      responseType: "blob",
    });

    return response.data as Blob;
  },
};
