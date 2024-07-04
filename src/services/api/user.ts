import { axiosInstance } from "@/lib/axiosInstance";
import axios, { AxiosResponse } from "axios";

export const getUserList = async (accessToken: string) => {
  const res = await axiosInstance.post<UserResponse>(
    `/api/data/user/list`,
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

type AddUserRequest = {
  username: string;
  password: string;
  nama_dinas: string;
  api_key: string;
  secret_key: string;
};

type AddUserResponse = MutateDataResponse | undefined;

export const addUserList = async (
  data: AddUserRequest,
  accessToken: string,
): Promise<AddUserResponse> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/data/user/create`,
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

type EditUserRequest = {
  id: string | number;
  username: string;
  password: string;
  nama_dinas: string;
  api_key: string;
  secret_key: string;
};

export const editUserList = async (
  data: EditUserRequest,
  accessToken: string,
): Promise<AddUserResponse> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/data/user/update`,
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

export const DeleteUserList = async (
  id: string | number,
  accessToken: string,
) => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/data/user/remove`,
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
