import StationTableSection from "@/components/section/StationTableSection";
import {
  getDeviceList,
  getProvinceList,
  getStationList,
} from "@/services/api/station";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Station() {
  const queryClient = new QueryClient();
  const cookie = getCookie("token", { cookies });

  if (!cookie) {
    redirect("/login");
  }

  await queryClient.prefetchQuery({
    queryKey: ["station"],
    queryFn: () => {
      return getStationList(cookie);
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["province"],
    queryFn: () => {
      return getProvinceList(cookie);
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["deviceList"],
    queryFn: () => {
      return getDeviceList(cookie);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StationTableSection cookie={cookie} />
    </HydrationBoundary>
  );
}
