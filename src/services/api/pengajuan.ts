import { axiosInstance } from "@/lib/axiosInstance";
import axios, { AxiosResponse } from "axios";

// --- Internet (Pulsa) ---

export const getPengajuanInternetList = async (
  accessToken: string,
  search?: string,
) => {
  const params = new URLSearchParams({
    limit: "1000",
    offset: "0",
    search: search || "",
  });

  const res = await axiosInstance.get<PengajuanResponse<PengajuanInternetData>>(
    `/api/pengajuan/pulsa?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};

export const addPengajuanInternet = async (
  data: PengajuanInternetRequest,
  accessToken: string,
): Promise<MutateDataResponse | undefined> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/pengajuan/pulsa`,
      { ...data },
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
      throw new Error(error.response?.data.message);
    }
  }
};

export const editPengajuanInternet = async (
  id: string | number,
  data: PengajuanInternetRequest,
  accessToken: string,
): Promise<MutateDataResponse | undefined> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.put(
      `/api/pengajuan/pulsa/${id}`,
      { ...data },
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
      throw new Error(error.response?.data.message);
    }
  }
};

export const deletePengajuanInternet = async (
  id: string | number,
  accessToken: string,
): Promise<MutateDataResponse | undefined> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.delete(
      `/api/pengajuan/pulsa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }
  }
};

// --- Listrik (Token) ---

export const getPengajuanListrikList = async (
  accessToken: string,
  search?: string,
) => {
  const params = new URLSearchParams({
    limit: "1000",
    offset: "0",
    search: search || "",
  });

  const res = await axiosInstance.get<PengajuanResponse<PengajuanListrikData>>(
    `/api/pengajuan/token?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};

export const addPengajuanListrik = async (
  data: PengajuanListrikRequest,
  accessToken: string,
): Promise<MutateDataResponse | undefined> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/pengajuan/token`,
      { ...data },
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
      throw new Error(error.response?.data.message);
    }
  }
};

export const editPengajuanListrik = async (
  id: string | number,
  data: PengajuanListrikRequest,
  accessToken: string,
): Promise<MutateDataResponse | undefined> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.put(
      `/api/pengajuan/token/${id}`,
      { ...data },
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
      throw new Error(error.response?.data.message);
    }
  }
};

export const deletePengajuanListrik = async (
  id: string | number,
  accessToken: string,
): Promise<MutateDataResponse | undefined> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.delete(
      `/api/pengajuan/token/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }
  }
};
