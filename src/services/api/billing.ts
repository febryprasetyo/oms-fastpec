import { axiosInstance } from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";

export const getBillingSummary = async (cookie: string, station?: string) => {
  const response = await axiosInstance.get(`/api/billing/summary`, {
    headers: { Authorization: `Bearer ${cookie}` },
    params: { station },
  });
  return response.data;
};

export const getBillingHistory = async (cookie: string, params: { station?: string; limit?: number; offset?: number }) => {
  const response = await axiosInstance.get(`/api/billing/history`, {
    headers: { Authorization: `Bearer ${cookie}` },
    params,
  });
  return response.data;
};

export const updateBillingStatus = async (cookie: string, payload: { type: 'paket' | 'token'; id: number; billing_status?: string; reimbursement_status?: string }) => {
  const response = await axiosInstance.put(`/api/billing/status`, payload, {
    headers: { Authorization: `Bearer ${cookie}` },
  });
  return response.data;
};
