import PengajuanSection from "@/components/section/PengajuanSection";
import {
  getPengajuanInternetList,
  getPengajuanListrikList,
} from "@/services/api/pengajuan";
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
  title: "Pengajuan | Fastpect",
  description: "Manajemen pengajuan sensor",
};

export default async function Pengajuan() {
  const queryClient = new QueryClient();
  const cookie = getCookie("token", { cookies });

  if (!cookie) {
    redirect("/login");
  }

  await queryClient.prefetchQuery({
    queryKey: ["pengajuan-internet"],
    queryFn: () => {
      return getPengajuanInternetList(cookie);
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["pengajuan-listrik"],
    queryFn: () => {
      return getPengajuanListrikList(cookie);
    },
  });
  


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PengajuanSection key="pengajuan-page" cookie={cookie} />
    </HydrationBoundary>
  );
}
