import axios from "@/lib/axios";

export const getStationTable = async (
  accessToken: string,
): Promise<StasionTable> => {
  const res = await axios.post(
    "/api/data/station/list",
    {
      limit: 10,
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

export const deleteStation = async (id: string, accessToken: string) => {
  const res = await axios.post(
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
  console.log(res);
  return res.data;
};
