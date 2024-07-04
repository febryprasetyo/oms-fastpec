import { axiosInstance } from "@/lib/axiosInstance";
import axios, { AxiosResponse } from "axios";

type EditStationRequest = {
  id: string;
  device_id: string;
  nama_stasiun: string;
  address: string;
  province_id: string | number;
  city_id: string | number;
  nama_dinas: string;
};
type AddStationRequest = {
  device_id: string;
  nama_stasiun: string;
  address: string;
  province_id: string | number;
  city_id: string | number;
  nama_dinas: string;
};

type AddStationResponse = MutateDataResponse | undefined;

export const getStationList = async (accessToken: string) => {
  const res = await axiosInstance.post<StationResponse>(
    `/api/data/station/list`,
    {
      limit: 1000,
      offset: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return res.data;
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
  provinceId: string | number,
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

export const addStationList = async (
  data: AddStationRequest,
  accessToken: string,
): Promise<AddStationResponse> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/data/station/create`,
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

export const editStationList = async (
  data: EditStationRequest,
  accessToken: string,
): Promise<AddStationResponse> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/data/station/update`,
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

export const DeleteStationList = async (
  data: string | number,
  accessToken: string,
) => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/data/station/remove`,
      {
        id: data,
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
