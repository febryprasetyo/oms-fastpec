import StationTableSection from "@/components/section/StationTableSection";
import { auth } from "@/lib/auth";
import { getStationList } from "@/services/api/stationList";
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StationTableSection />
    </HydrationBoundary>
  );
}
