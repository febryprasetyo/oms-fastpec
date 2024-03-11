import { axiosInstance } from "@/lib/axiosInstance";
import axios, { AxiosResponse } from "axios";

export const getUserList = async (
  accessToken: string,
): Promise<UserResponse> => {
  try {
    const res: AxiosResponse<UserResponse> = await axiosInstance.post(
      `/api/data/user/list`,
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
