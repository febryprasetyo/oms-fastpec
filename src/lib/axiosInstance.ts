import axios, { AxiosInstance } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://103.84.206.53:3304",
  headers: {
    "Content-Type": "application/json",
  },
});
