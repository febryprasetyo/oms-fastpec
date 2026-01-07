import HistorySection from "@/components/section/HistorySection";
import { Suspense } from "react";
import { getStationList } from "@/services/api/station";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function User({
  searchParams,
}: {
  searchParams: {
    limit: string;
    page: string;
  };
}) {
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
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <HistorySection cookie={cookie} searchParams={searchParams} />
      </Suspense>
    </HydrationBoundary>
  );
}
