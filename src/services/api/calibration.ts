import { calibrationParameterConfigs, getCalibrationParameterConfig } from "@/config/calibration-parameters";
import type { AxiosProgressEvent } from "axios";
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
  CalibrationApiDocumentation,
  CalibrationApiStatus,
  CalibrationApiWaterSample,
  CalibrationDetail,
  CalibrationDocumentation,
  CalibrationPhotoType,
  ParameterCalibrationDetail,
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

export interface CalibrationListResult {
  items: Calibration[];
  total: number;
}

interface ApiCalibrationRecord {
  id: string;
  report_no: string;
  station_id: number;
  station_name?: string;
  station_address?: string;
  station_coordinate?: string;
  station_city?: string;
  calibration_start_date: string;
  calibration_end_date: string;
  officer_name?: string;
  status: CalibrationApiStatus;
  notes?: string | null;
  verification_uuid?: string;
  verification_url?: string;
  qr_code_data_url?: string;
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
  coordinate?: string;
}

interface ParameterListItem {
  id: number;
  name: string;
  unit: string;
  standards: { crm_name: string; crm_standard_value: number }[];
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

const nullableApiNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toParameter = (parameterId: string, parameterName?: string): Parameter => {
  const config = getCalibrationParameterConfig(parameterId);
  return { id: parameterId, name: parameterName?.trim() || config?.name || "", spec: "" };
};

const mapWaterSample = (sample: CalibrationApiWaterSample): WaterSample => ({
  ...(sample.id ? { id: String(sample.id) } : {}),
  sampleName: sample.sample_name?.trim() || "Sampel Air",
  temperature: sample.suhu ?? undefined,
  ph: sample.ph ?? undefined,
  doValue: sample.do ?? undefined,
  tds: sample.tds ?? undefined,
  turbidity: sample.tur ?? undefined,
  cod: sample.cod ?? undefined,
  bod: sample.bod ?? undefined,
  tss: sample.tss ?? undefined,
  nh3: sample.amonia ?? undefined,
  no3: sample.nitrat ?? undefined,
  no2: sample.nitrit ?? undefined,
  orp: sample.orp ?? undefined,
  depth: sample.kedalaman ?? undefined,
});

export const mapCalibrationDocumentation = (
  documentation: CalibrationApiDocumentation,
): CalibrationDocumentation => ({
  id: documentation.id,
  calibrationDetailId: documentation.calibration_detail_id,
  parameterId: String(documentation.parameter_id),
  photoType: documentation.photo_type,
  previewUrl: documentation.preview_url,
  mimeType: documentation.mime_type,
  size: documentation.file_size,
  ...(documentation.width === undefined ? {} : { width: documentation.width }),
  ...(documentation.height === undefined ? {} : { height: documentation.height }),
  ...(documentation.checksum === undefined ? {} : { checksum: documentation.checksum }),
  uploadedAt: documentation.uploaded_at,
});

const mapCalibration = (calibration: ApiCalibrationRecord): Calibration => {
  const coordinate = parseCoordinate(calibration.station_coordinate);

  return {
    id: calibration.id,
    reportNo: calibration.report_no,
    stationId: String(calibration.station_id),
    stationName: calibration.station_name ?? "",
    address: calibration.station_address ?? "",
    stationCity: calibration.station_city,
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    calibrationStartDate: calibration.calibration_start_date,
    calibrationEndDate: calibration.calibration_end_date,
    calibrationDate: `${calibration.calibration_start_date} – ${calibration.calibration_end_date}`,
    contactPerson: "",
    phone: "",
    officer: calibration.officer_name ?? "",
    status: displayStatus(calibration.status),
    createdAt: calibration.created_at,
    updatedAt: calibration.updated_at,
    verificationUrl: calibration.verification_url,
    qrCodeDataUrl: calibration.qr_code_data_url,
    uuid: calibration.verification_uuid,
  };
};

export const mapCalibrationDetail = (calibration: ApiCalibrationRecord): CalibrationDetail => ({
  ...mapCalibration(calibration),
  parameters: (calibration.details ?? []).map((detail) => {
    const parameter = toParameter(String(detail.parameter_id), detail.parameter_name);
    const coefficients = parseCoefficients(detail.coefficients);
    const normalizedParameterName = parameter.name.trim().toLowerCase();
    const inferredCoeffType = normalizedParameterName === "ph"
      ? "K1-K6"
      : ["nitrat", "nitrit", "no3", "no2"].includes(normalizedParameterName)
        ? undefined
        : "K/B";
    const coeffType = detail.coeff_type ?? inferredCoeffType;
    const coefficientKeys = coeffType === "K1-K6"
      ? ["k1", "k2", "k3", "k4", "k5", "k6"]
      : coeffType === "K/B" ? ["k", "b"] : [];

    return {
      id: detail.id,
      parameterId: parameter.id,
      parameterName: parameter.name || `Parameter ${detail.parameter_id}`,
      parameterUnit: detail.parameter_unit ?? undefined,
      spec: parameter.spec,
      coeffType,
      crmReferenceValue: nullableApiNumber(detail.crm_reference_value),
      crmReadingValue: nullableApiNumber(detail.crm_reading_value),
      remark: detail.remark,
      results: detail.standards.map((standard) => ({
        id: standard.id,
        standardName: standard.crm_name?.trim() || "Standar",
        standardValue: nullableApiNumber(standard.crm_standard_value),
        minAcceptable: nullableApiNumber(standard.min_acceptable),
        maxAcceptable: nullableApiNumber(standard.max_acceptable),
        value: standard.calibration_result === null || standard.calibration_result === undefined
          ? ""
          : Number(standard.calibration_result).toFixed(2),
      })),
      coefficients: coefficientKeys.map((key) => ({
        key,
        value: coefficients[key] !== undefined && Number.isFinite(Number(coefficients[key])) ? Number(coefficients[key]) : undefined,
      })),
      status: detail.calculation_result,
      documentation: (detail.documentation ?? []).reduce<ParameterCalibrationDetail["documentation"]>(
        (mapped, documentation) => {
          mapped[documentation.photo_type] = mapCalibrationDocumentation(documentation);
          return mapped;
        },
        {},
      ),
    };
  }),
  waterSamples: (calibration.waterSamples ?? []).map(mapWaterSample),
  notes: calibration.notes ?? "",
});

export const calibrationService = {
  async getStations(accessToken: string): Promise<Station[]> {
    const response = await axiosInstance.post<ApiResponse<{ values?: StationListItem[]; list?: StationListItem[] }>>(
      "/api/data/station/list",
      { limit: 100, offset: 0 },
      { headers: authHeaders(accessToken) },
    );

    const stationItems = response.data.data.values ?? response.data.data.list ?? [];

    return stationItems.map((station) => {
      const coordinate = parseCoordinate(station.coordinate);

      return {
      id: String(station.id ?? station.id_stasiun ?? station.uuid ?? ""),
      name: station.nama_stasiun ?? station.name ?? "",
      address: station.address ?? station.lokasi ?? "",
      latitude: Number(station.latitude ?? coordinate.latitude),
      longitude: Number(station.longitude ?? coordinate.longitude),
      coordinate: station.coordinate,
    };
    });
  },

  async getMasterParameters(accessToken: string): Promise<Parameter[]> {
    const response = await axiosInstance.get<ApiResponse<ParameterListItem[]>>("/api/calibrations/parameters", {
      headers: authHeaders(accessToken),
    });
    return response.data.data.map((parameter) => ({
      id: String(parameter.id), name: parameter.name, unit: parameter.unit, spec: "",
      standards: parameter.standards.map((standard) => ({ crmName: standard.crm_name, standardValue: standard.crm_standard_value })),
    }));
  },

  async getCalibrations(accessToken: string, options: { limit: number; offset: number; status?: CalibrationApiStatus }): Promise<CalibrationListResult> {
    const response = await axiosInstance.get<ApiResponse<ApiCalibrationRecord[]>>("/api/calibrations", {
      headers: authHeaders(accessToken),
      params: options,
    });

    return { items: response.data.data.map(mapCalibration), total: response.data.total ?? 0 };
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

  async updateCalibration(id: string, data: unknown, accessToken: string): Promise<void> {
    const payload: UpdateCalibrationPayload = UpdateCalibrationPayloadSchema.parse(data);
    await axiosInstance.put<ApiResponse<Pick<ApiCalibrationRecord, "id" | "status" | "updated_at">>>(`/api/calibrations/${id}`, payload, {
      headers: authHeaders(accessToken),
    });
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

  async uploadDocumentation({
    calibrationId,
    detailId,
    photoType,
    file,
    accessToken,
    onUploadProgress,
  }: {
    calibrationId: string;
    detailId: number;
    photoType: CalibrationPhotoType;
    file: File;
    accessToken: string;
    onUploadProgress?: (event: AxiosProgressEvent) => void;
  }): Promise<CalibrationDocumentation> {
    const body = new FormData();
    body.append("file", file, file.name);
    const response = await axiosInstance.post<ApiResponse<CalibrationApiDocumentation>>(
      `/api/calibrations/${calibrationId}/details/${detailId}/documentation/${photoType}`,
      body,
      {
        headers: { ...authHeaders(accessToken), "Content-Type": undefined },
        onUploadProgress,
      },
    );
    return mapCalibrationDocumentation(response.data.data);
  },

  async deleteDocumentation({
    calibrationId,
    detailId,
    photoType,
    accessToken,
  }: {
    calibrationId: string;
    detailId: number;
    photoType: CalibrationPhotoType;
    accessToken: string;
  }): Promise<void> {
    await axiosInstance.delete(
      `/api/calibrations/${calibrationId}/details/${detailId}/documentation/${photoType}`,
      { headers: authHeaders(accessToken) },
    );
  },

  async downloadPdf(id: string, accessToken: string): Promise<Blob> {
    const response = await axiosInstance.get(`/api/calibrations/${id}/print`, {
      headers: authHeaders(accessToken),
      responseType: "blob",
    });

    return response.data as Blob;
  },

};
