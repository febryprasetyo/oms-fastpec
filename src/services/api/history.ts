import { axiosInstance } from "@/lib/axiosInstance";
import { parseISO, format } from "date-fns";

type Props = {
  cookie: string;
  startDate?: Date;
  endDate?: Date;
  startHour?: Date;
  endHour?: Date;
  stationFilter?: string;
};

export const getHistoryList = async ({
  cookie,
  startDate,
  endDate,
  startHour,
  endHour,
  stationFilter,
}: Props) => {
  const params: { [key: string]: string } = {};

  if (startDate && endDate) {
    const formattedFromDate = format(
      parseISO(startDate.toISOString()),
      "yyyy-MM-dd",
    );
    const formattedToDate = format(
      parseISO(endDate.toISOString()),
      "yyyy-MM-dd",
    );
    params["startDate"] = formattedFromDate;
    params["endDate"] = formattedToDate;
  }

  if (startHour && endHour) {
    const formattedStartHour = format(startHour, "HH:mm:ss");
    const formattedEndHour = format(endHour, "HH:mm:ss");
    params["startHour"] = formattedStartHour;
    params["endHour"] = formattedEndHour;
  }

  if (stationFilter && stationFilter !== "all") {
    params["namaStasiun"] = stationFilter;
  }

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const res = await axiosInstance.get<HistoryResponse>(
    `/api/data/mqtt/list?${queryString}&limit=10000`,
    {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
    },
  );

  return res.data;
};

export const exportDatabase = async ({
  cookie,
  startDate,
  endDate,
  startHour,
  endHour,
}: Props) => {
  const params: { [key: string]: string } = {};

  if (startDate && endDate) {
    const formattedFromDate = format(
      parseISO(startDate.toISOString()),
      "yyyy-MM-dd",
    );
    const formattedToDate = format(
      parseISO(endDate.toISOString()),
      "yyyy-MM-dd",
    );
    params["startDate"] = formattedFromDate;
    params["endDate"] = formattedToDate;
  }

  if (startHour && endHour) {
    const formattedStartHour = format(startHour, "HH:mm:ss");
    const formattedEndHour = format(endHour, "HH:mm:ss");
    params["startHour"] = formattedStartHour;
    params["endHour"] = formattedEndHour;
  }

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return await axiosInstance.get<DatabaseExport>(
    `/api/data/klhk/export?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
      responseType: "blob",
    },
  );
};
