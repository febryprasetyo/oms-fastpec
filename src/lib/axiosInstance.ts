import axios, { AxiosInstance } from "axios";

const BASE_URL = process.env.API_URL || "http://103.84.206.53:3304"; // Api URL sesuaikan disini,karena jika hanya di ENV selalu error

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
