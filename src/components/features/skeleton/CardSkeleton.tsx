import { Skeleton } from "@/components/ui/skeleton";

type Props = {};

export default function CardSkeleton({}: Props) {
  return (
    <div>
      <div className="h-full w-full overflow-hidden rounded-lg bg-white shadow dark:bg-darkSecondary">
        <div className="relative aspect-video w-full">
          <Skeleton className="w-full bg-dark_accent" />
        </div>
        <div className="space-y-1 p-5">
          <Skeleton className="h-5 w-20 bg-dark_accent" />
          <Skeleton className="h-5 w-20 bg-dark_accent" />
        </div>
      </div>
    </div>
  );
}
