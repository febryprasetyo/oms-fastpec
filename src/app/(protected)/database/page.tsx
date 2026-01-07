import DatabaseTableSection from "@/components/section/DatabaseTableSection";
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

type Props = {
  searchParams: {
    page: string | null;
    limit: string | null;
  };
};

export default async function User({ searchParams }: Props) {
  const queryClient = new QueryClient();
  const cookie = getCookie("token", { cookies });
  if (!cookie) {
    redirect("/login");
  }
  const page = searchParams?.page || "1";
  const limit = searchParams?.limit || "10";

  await queryClient.prefetchQuery({
    queryKey: ["station"],
    queryFn: () => {
      return getStationList(cookie);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <DatabaseTableSection cookie={cookie} limit={limit} page={page} />
      </Suspense>
    </HydrationBoundary>
  );
}
