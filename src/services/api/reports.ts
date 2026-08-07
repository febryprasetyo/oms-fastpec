import { axiosInstance } from "@/lib/axiosInstance";

export type Report = {
  id: number;
  title: string;
  station_uuid: string;
  description: string;
  pic_id?: number;
  pic_name: string;
  category: 'Perbaikan' | 'Penggantian Part';
  status: 'Open' | 'Eskalasi' | 'Selesai';
  created_at: string;
  updated_at: string;
};

export type CreateReportRequest = {
  title: string;
  station_uuid: string;
  description: string;
  category: string;
};

export type UpdateReportRequest = {
  title?: string;
  description?: string;
  category?: string;
  pic_id?: number;
  pic_name?: string;
};

export const getReports = async (
  accessToken: string,
  params?: { station_uuid?: string; status?: string; limit?: number; offset?: number }
) => {
  const res = await axiosInstance.get(`/api/reports`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params
  });
  return res.data;
};

export const createReport = async (
  accessToken: string,
  data: CreateReportRequest
) => {
  const res = await axiosInstance.post(`/api/reports`, data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

export const updateReport = async (
  accessToken: string,
  id: number,
  data: UpdateReportRequest
) => {
  const res = await axiosInstance.put(`/api/reports/${id}`, data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

export const getReportDetail = async (
  accessToken: string,
  id: number
) => {
  const res = await axiosInstance.get(`/api/reports/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};
