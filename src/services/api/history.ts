import { axiosInstance } from "@/lib/axiosInstance";
import { parseISO, format } from "date-fns";

type Props = {
  cookie: string;
  startDate?: Date;
  endDate?: Date;
  startHour?: Date;
  endHour?: Date;
  stationFilter?: string;
  limit?: string;
  page?: string;
};

export const getHistoryList = async ({
  cookie,
  startDate,
  endDate,
  startHour,
  endHour,
  stationFilter,
  limit = "10",
  page = "1",
}: Props) => {
  const params = new URLSearchParams();

  if (startDate && endDate) {
    const formattedFromDate = format(
      parseISO(startDate.toISOString()),
      "yyyy-MM-dd",
    );
    const formattedToDate = format(
      parseISO(endDate.toISOString()),
      "yyyy-MM-dd",
    );
    params.set("startDate", formattedFromDate);
    params.set("endDate", formattedToDate);
  }

  if (startHour && endHour) {
    const formattedStartHour = format(startHour, "HH:mm:ss");
    const formattedEndHour = format(endHour, "HH:mm:ss");
    params.set("startHour", formattedStartHour);
    params.set("endHour", formattedEndHour);
  }

  if (stationFilter && stationFilter !== "all") {
    params.set("namaStasiun", stationFilter);
  }

  params.set("limit", limit);
  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.set("offset", offset.toString());
  const res = await axiosInstance.get<HistoryResponse>(
    `/api/data/mqtt/list?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
    },
  );

  return res.data;
};

export const exportHistory = async ({
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
    `/api/data/mqtt/export?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
      responseType: "blob",
    },
  );
};
