import BillingSection from "@/components/section/BillingSection";
import { getBillingSummary, getBillingHistory } from "@/services/api/billing";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const queryClient = new QueryClient();
  const cookie = getCookie("token", { cookies });

  if (!cookie) {
    redirect("/login");
  }

  // Prefetch summary and history
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["billing-summary", ""],
      queryFn: () => getBillingSummary(cookie as string),
    }),
    queryClient.prefetchQuery({
      queryKey: ["billing-history", ""],
      queryFn: () => getBillingHistory(cookie as string, { limit: 100 }),
    })
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BillingSection cookie={cookie as string} />
    </HydrationBoundary>
  );
}
