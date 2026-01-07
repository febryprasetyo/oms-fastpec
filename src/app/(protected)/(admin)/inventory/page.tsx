import InventorySection from "@/components/section/InventorySection";
import { getInventoryTableList } from "@/services/api/inventory";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventaris | Fastpect",
  description: "Manajemen inventaris sensor",
};

export default async function Station() {
  const queryClient = new QueryClient();
  const cookie = getCookie("token", { cookies });

  if (!cookie) {
    redirect("/login");
  }

 
  await queryClient.prefetchQuery({
    queryKey: ["inventory"],
    queryFn: () => {
      return getInventoryTableList(cookie);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InventorySection key="inventory-page" cookie={cookie} />
    </HydrationBoundary>
  );
}
