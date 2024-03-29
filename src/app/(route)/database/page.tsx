import DatabaseTableSection from "@/components/section/DatabaseTableSection";
import { auth } from "@/lib/auth";
import { getDatabaseList } from "@/services/api/database";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function User() {
  const queryClient = new QueryClient();
  const session = await auth();

  await queryClient.prefetchQuery({
    queryKey: ["database"],
    queryFn: () => {
      return getDatabaseList(session?.user.token.access_token as string);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DatabaseTableSection />
    </HydrationBoundary>
  );
}
