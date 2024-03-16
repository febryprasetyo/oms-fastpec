import { axiosInstance } from "@/lib/axiosInstance";
import axios, { AxiosResponse } from "axios";

export const getDeviceTableList = async (
  accessToken: string,
): Promise<DeviceTableResponse> => {
  try {
    const res: AxiosResponse<DeviceTableResponse> = await axiosInstance.post(
      `/api/data/device/list`,
      {
        limit: 1000,
        offset: 0,
      },
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
      return {
        success: false,
        statusCode: error.response?.status,
        data: {
          values: [],
          total: "0",
        },
      };
    }
    return {
      success: false,
      statusCode: 500,
      data: {
        values: [],
        total: "0",
      },
    };
  }
};

type AddDeviceRequest = {
  id_mesin: string;
  dinas_id: string;
  nama_stasiun: string;
};

type AddDeviceResponse = MutateDataResponse | undefined;

export const addDeviceList = async (
  data: AddDeviceRequest,
  accessToken: string,
): Promise<AddDeviceResponse> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/data/device/create`,
      {
        ...data,
      },
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
export const editDeviceList = async (
  id: string | undefined,
  data: AddDeviceRequest,
  accessToken: string,
): Promise<AddDeviceResponse> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/data/device/update`,
      {
        id: id || "",
        ...data,
      },
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

export const DeleteDeviceList = async (id: string, accessToken: string) => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/data/device/remove`,
      {
        id: id,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }
  }
};
