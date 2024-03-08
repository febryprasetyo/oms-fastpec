import { axiosInstance } from "@/lib/axiosInstance";
import axios, { AxiosResponse } from "axios";

export const getStationList = async (
  accessToken: string,
): Promise<StationResponse> => {
  try {
    const res: AxiosResponse<StationResponse> = await axiosInstance.post(
      `/api/data/station/list`,
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

export const deleteStation = async (id: string, accessToken: string) => {
  const res = await axiosInstance.post(
    "/api/data/station/remove",
    {
      id: 14,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  console.log(res);
  return res.data;
};
