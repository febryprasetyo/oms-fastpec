import axios from "@/lib/axios";

export const getStasionList = async (
  accessToken: string,
): Promise<StasionList> => {
  const response = await axios.get("/api/data/station/device-list", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
