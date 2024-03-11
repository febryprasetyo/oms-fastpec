import { axiosInstance } from "@/lib/axiosInstance";
import axios, { AxiosResponse } from "axios";

export const getDeviceTableList = async (
  accessToken: string,
): Promise<DeviceTableResponse> => {
  try {
    const res: AxiosResponse<DeviceTableResponse> = await axiosInstance.post(
      `/api/data/device/list`,
      {
        limit: 10,
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
