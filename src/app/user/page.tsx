import UserTableSection from "@/components/section/UserTableSection";
import { auth } from "@/lib/auth";
import { getUserList } from "@/services/api/user";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function User() {
  const queryClient = new QueryClient();
  const session = await auth();

  await queryClient.prefetchQuery({
    queryKey: ["user"],
    queryFn: () => {
      return getUserList(session?.user.token.access_token as string);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserTableSection />
    </HydrationBoundary>
  );
}
