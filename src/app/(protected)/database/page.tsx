import DatabaseTableSection from "@/components/section/DatabaseTableSection";
import { getDatabaseList } from "@/services/api/database";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function User() {
  const queryClient = new QueryClient();
  const cookie = getCookie("token", { cookies });
  if (!cookie) {
    redirect("/login");
  }

  await queryClient.prefetchQuery({
    queryKey: ["database", null, null],
    queryFn: () => {
      return getDatabaseList(cookie);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DatabaseTableSection cookie={cookie} />
    </HydrationBoundary>
  );
}
