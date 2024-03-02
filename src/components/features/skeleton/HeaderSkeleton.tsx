import { Skeleton } from "@/components/ui/skeleton";

type Props = {};

export default function HeaderSkeleton({}: Props) {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-[200px]" />
        <Skeleton className="h-5 w-[150px]" />
      </div>
    </div>
  );
}
