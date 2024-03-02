import { Skeleton } from "@/components/ui/skeleton";

type Props = {};

export default function NavLinkSkeleton({}: Props) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full dark:!bg-dark_accent" />
      <Skeleton className="aspect-square w-full rounded-md dark:!bg-dark_accent" />
      <Skeleton className="aspect-square w-full rounded-md dark:!bg-dark_accent" />
      <Skeleton className="aspect-square w-full rounded-md dark:!bg-dark_accent" />
      <Skeleton className="aspect-square w-full rounded-md dark:!bg-dark_accent" />
    </div>
  );
}
