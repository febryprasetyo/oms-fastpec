import DeviceTableSection from "@/components/section/DeviceTableSection";
import { getDeviceTableList } from "@/services/api/device";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Station() {
  const queryClient = new QueryClient();
  const cookie = getCookie("token", { cookies });

  if (!cookie) {
    redirect("/login");
  }

  await queryClient.prefetchQuery({
    queryKey: ["device"],
    queryFn: () => {
      return getDeviceTableList(cookie);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DeviceTableSection cookie={cookie} />
    </HydrationBoundary>
  );
}
