import DashboardSection from "@/components/section/DashboardSection";
import { getStationList } from "@/services/api/station";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardSection cookie={cookie} />
    </HydrationBoundary>
  );
}
