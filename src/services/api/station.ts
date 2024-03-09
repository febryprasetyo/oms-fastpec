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

export const getProvinceList = async (
  accessToken: string,
): Promise<ProvinceResponse> => {
  try {
    const res: AxiosResponse<ProvinceResponse> = await axiosInstance.get(
      `/api/data/station/province-list`,
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
export const getDeviceList = async (
  accessToken: string,
): Promise<DeviceResponse> => {
  try {
    const res: AxiosResponse<DeviceResponse> = await axiosInstance.get(
      `/api/data/station/device-list`,
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

export const getCityList = async (
  accessToken: string,
  provinceId: string,
): Promise<CityResponse> => {
  try {
    if (provinceId !== "") {
      const res: AxiosResponse<CityResponse> = await axiosInstance.get(
        `/api/data/station/city-list/${provinceId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return res.data;
    }
    return {
      success: false,
      data: [],
    };
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
  return res.data;
};
