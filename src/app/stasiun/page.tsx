import StationTableSection from "@/components/section/StationTableSection";
import { auth } from "@/lib/auth";
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

export default async function Station() {
  const queryClient = new QueryClient();
  const session = await auth();

  await queryClient.prefetchQuery({
    queryKey: ["stasiun"],
    queryFn: async () => {
      const res = await getStationList(
        session?.user.token.access_token as string,
      );
      return res;
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["province"],
    queryFn: async () => {
      const res = await getProvinceList(
        session?.user.token.access_token as string,
      );
      return res;
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["device"],
    queryFn: async () => {
      const res = await getDeviceList(
        session?.user.token.access_token as string,
      );
      return res;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StationTableSection />
    </HydrationBoundary>
  );
}
