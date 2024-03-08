import { Skeleton } from "@/components/ui/skeleton";

type Props = {};

export default function CardSkeleton({}: Props) {
  return (
    <div>
      <div className="h-full w-full overflow-hidden rounded-lg bg-white shadow dark:bg-darkSecondary">
        <div className="w-ful relative aspect-video">
          <Skeleton className="h-full w-full !bg-dark_accent" />
        </div>
        <div className="space-y-3 p-5">
          <Skeleton className="h-5 w-56 !bg-dark_accent" />
          <Skeleton className="h-5 w-72 !bg-dark_accent" />
          <Skeleton className="h-5 w-60 !bg-dark_accent" />
        </div>
      </div>
    </div>
  );
}
