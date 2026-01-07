import { axiosInstance } from "@/lib/axiosInstance";
import axios, { AxiosResponse } from "axios";

export const getInventoryTableList = async (
  accessToken: string,
  search?: string,
) => {
  const res = await axiosInstance.post<InventoryResponse>(
    `/api/Inventory/stok`,
    {
      limit: 1000,
      offset: 0,
      search: search || "",
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return res.data;
};

type AddInventoryRequest = {
  products: string;
  serial_number: string;
  condition: string;
  date_in: string;
  date_out?: string;
};

type AddInventoryResponse = MutateDataResponse | undefined;

export const addInventoryList = async (
  data: AddInventoryRequest,
  accessToken: string,
): Promise<AddInventoryResponse> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/inventory/stok/create`,
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
export const editInventoryList = async (
  id: string | number,
  data: AddInventoryRequest,
  accessToken: string,
): Promise<AddInventoryResponse> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/inventory/stok/update/${id}`,
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

export const DeleteInventoryList = async (
  id: string | number,
  accessToken: string,
): Promise<MutateDataResponse | undefined> => {
  try {
    const res: AxiosResponse<MutateDataResponse> = await axiosInstance.post(
      `/api/inventory/stok/remove/${id}`,
      {},
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
