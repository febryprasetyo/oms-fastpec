import { axiosInstance } from "@/lib/axiosInstance";
import { 
  Calibration, 
  CalibrationDetail, 
  Station, 
  Parameter 
} from "@/types/calibration";

export interface CalibrationListResponse {
  success: boolean;
  data: Calibration[];
  total: number;
}

export interface CalibrationDetailResponse {
  success: boolean;
  data: CalibrationDetail;
}

export interface StationListResponse {
  success: boolean;
  data: Station[];
}

export interface ParameterListResponse {
  success: boolean;
  data: Parameter[];
}

export interface CommonResponse {
  success: boolean;
  message?: string;
}

export const calibrationService = {
  getStations: async (accessToken: string): Promise<Station[]> => {
    // API mock/call implementation, fallback to list endpoint
    try {
      const res = await axiosInstance.get<StationListResponse>(`/api/stations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data.data;
    } catch {
      // Fallback fallback station list from typical payload if route doesn't exist
      const res = await axiosInstance.post<{ data: { list: any[] } }>(
        `/api/data/station/list`,
        { limit: 100, offset: 0 },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return (res.data?.data?.list || []).map((s: any) => ({
        id: s.id_stasiun || s.uuid || String(s.id),
        name: s.nama_stasiun || s.name,
        address: s.address || s.lokasi || "Unknown",
        latitude: parseFloat(s.latitude) || -8.3272340,
        longitude: parseFloat(s.longitude) || 114.6118410,
      }));
    }
  },

  getMasterParameters: async (accessToken: string): Promise<Parameter[]> => {
    try {
      const res = await axiosInstance.get<ParameterListResponse>(`/api/master-parameters`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data.data;
    } catch {
      // Return defaults if API is not fully configured
      return [
        { id: "1", name: "Temperature", spec: "%trueness 99-101" },
        { id: "2", name: "pH", spec: "Accuracy ± 0.05" },
        { id: "3", name: "DO", spec: "%trueness 99-101" },
        { id: "4", name: "Conductivity", spec: "%trueness 99-101" },
        { id: "5", name: "Turbidity", spec: "%trueness 90-110" },
        { id: "6", name: "COD", spec: "%trueness 99-100" },
        { id: "7", name: "BOD", spec: "%trueness 99-100" },
        { id: "8", name: "TSS", spec: "%trueness 99-100" },
        { id: "9", name: "NH3", spec: "%trueness 99-101" },
        { id: "10", name: "NO3", spec: "%trueness 99-100" },
        { id: "11", name: "ORP", spec: "%trueness 99-101" },
      ];
    }
  },

  getCalibrations: async (accessToken: string): Promise<Calibration[]> => {
    const res = await axiosInstance.get<CalibrationListResponse>(`/api/calibrations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data.data;
  },

  getCalibrationById: async (id: string, accessToken?: string): Promise<CalibrationDetail> => {
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
    const res = await axiosInstance.get<CalibrationDetailResponse>(`/api/calibrations/${id}`, {
      headers,
    });
    return res.data.data;
  },

  getCalibrationByUuid: async (uuid: string): Promise<CalibrationDetail> => {
    const res = await axiosInstance.get<CalibrationDetailResponse>(`/api/verify/${uuid}`);
    return res.data.data;
  },

  createCalibration: async (data: any, accessToken: string): Promise<Calibration> => {
    const res = await axiosInstance.post<{ success: boolean; data: Calibration }>(
      `/api/calibrations`,
      data,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res.data.data;
  },

  updateCalibration: async (id: string, data: any, accessToken: string): Promise<Calibration> => {
    const res = await axiosInstance.put<{ success: boolean; data: Calibration }>(
      `/api/calibrations/${id}`,
      data,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res.data.data;
  },

  deleteCalibration: async (id: string, accessToken: string): Promise<void> => {
    await axiosInstance.delete(`/api/calibrations/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  approveCalibration: async (id: string, accessToken: string): Promise<Calibration> => {
    const res = await axiosInstance.post<{ success: boolean; data: Calibration }>(
      `/api/calibrations/${id}/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res.data.data;
  },
};
