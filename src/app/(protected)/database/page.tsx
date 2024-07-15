import DatabaseTableSection from "@/components/section/DatabaseTableSection";
import { getDatabaseList } from "@/services/api/database";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { format, parseISO, subMonths } from "date-fns";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function User() {
  const queryClient = new QueryClient();
  const cookie = getCookie("token", { cookies });
  if (!cookie) {
    redirect("/login");
  }

  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const formatedToday = format(parseISO(today.toISOString()), "yyyy-MM-dd");
  const formatedThreeMonthsAgo = format(
    parseISO(threeMonthsAgo.toISOString()),
    "yyyy-MM-dd",
  );

  const dateKey = { startDate: formatedThreeMonthsAgo, endDate: formatedToday };

  await queryClient.prefetchQuery({
    queryKey: ["database", dateKey, null],
    queryFn: () => {
      return getDatabaseList({
        cookie,
        startDate: threeMonthsAgo,
        endDate: today,
      });
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DatabaseTableSection cookie={cookie} />
    </HydrationBoundary>
  );
}
