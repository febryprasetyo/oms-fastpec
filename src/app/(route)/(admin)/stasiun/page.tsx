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
    queryKey: ["station"],
    queryFn: () => {
      return getStationList(session?.user.token.access_token as string);
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["province"],
    queryFn: () => {
      return getProvinceList(session?.user.token.access_token as string);
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["deviceList"],
    queryFn: () => {
      return getDeviceList(session?.user.token.access_token as string);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StationTableSection />
    </HydrationBoundary>
  );
}
