import { axiosInstance } from "@/lib/axiosInstance";
import { AxiosResponse } from "axios";

type TBody = {
  username: string;
  password: string;
};

export const login = async (body: TBody) => {
  return axiosInstance.post<TAuthResponse>("/api/auth/login", body);
};
