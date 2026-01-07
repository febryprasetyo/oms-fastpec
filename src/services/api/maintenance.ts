import { axiosInstance } from "@/lib/axiosInstance";
import axios from "axios";

export type MaintenanceStatus = "start" | "stop" | "calibration" | "maintenance";

export type MaintenanceRequest = {
  uuid: string;
  status: MaintenanceStatus;
};

export type MaintenanceLogRequest = {
  uuid: string;
  status: string;
  activity_type: string;
  description: string;
  next_calibration_date: string;
  technician_name?: string;
};

export type CalibrationScheduleRequest = {
  uuid: string;
  next_calibration_date: string;
};

export type MaintenanceHistoryItem = {
  id: number;
  uuid: string;
  activity_type: string;
  description: string;
  technician_name: string;
  created_by: string;
  created_name?: string;
  created_at: string;
};

export const updateMaintenanceStatus = async (
  data: MaintenanceRequest,
  accessToken: string,
) => {
  try {
    const res = await axiosInstance.post(
      `/api/maintenance`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || "Gagal memperbarui status maintenance");
    }
    throw error;
  }
};

export const saveMaintenanceLog = async (
  data: MaintenanceLogRequest,
  accessToken: string,
) => {
  try {
    const res = await axiosInstance.post(`/api/maintenance`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || "Gagal menyimpan log maintenance");
    }
    throw error;
  }
};

export const getMaintenanceHistory = async (
  uuid: string,
  accessToken: string,
) => {
  try {
    const res = await axiosInstance.get(`/api/maintenance/history/${uuid}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || "Gagal mengambil riwayat maintenance");
    }
    throw error;
  }
};

export const updateCalibrationSchedule = async (
  data: CalibrationScheduleRequest,
  accessToken: string,
) => {
  try {
    const res = await axiosInstance.post(`/api/maintenance/calibration-schedule`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || "Gagal memperbarui jadwal kalibrasi");
    }
    throw error;
  }
};
