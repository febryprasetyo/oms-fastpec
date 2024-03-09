import { axiosInstance } from "@/lib/axiosInstance";
import axios, { AxiosResponse } from "axios";

export const getDatabaseList = async (
  accessToken: string,
): Promise<DatabaseResponse> => {
  try {
    const res: AxiosResponse<DatabaseResponse> = await axiosInstance.get(
      `/api/data/klhk/list`,

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
        data: [],
      };
    }
    return {
      success: false,
      statusCode: 500,
      data: [],
    };
  }
};
