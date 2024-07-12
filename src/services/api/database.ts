// @ts-ignore
import { DateRange } from "react-day-picker";
import { axiosInstance } from "@/lib/axiosInstance";
import { parseISO, format } from "date-fns";

export const getDatabaseList = async (
  accessToken: string,
  date?: DateRange,
  startHour?: Date | undefined,
  endHour?: Date | undefined,
) => {
  const params: { [key: string]: string } = {};

  if (date?.from && date?.to) {
    const formattedFromDate = format(
      parseISO(date.from.toISOString()),
      "yyyy-MM-dd",
    );
    const formattedToDate = format(
      parseISO(date.to.toISOString()),
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

  const res = await axiosInstance.get<DatabaseResponse>(
    `/api/data/klhk/list?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return res.data;
};
