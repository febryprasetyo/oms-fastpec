import { Skeleton } from "@/components/ui/skeleton";

export default function MonitoringCardSkeleton() {
  return (
    <div className="flex w-full flex-col items-center justify-between overflow-hidden rounded-xl bg-white shadow dark:bg-darkSecondary">
      <div className="w-full space-y-4 p-5 text-center">
        <Skeleton className="mx-auto h-7 w-32 bg-slate-200 dark:bg-dark_accent" />
        <Skeleton className="w-full space-y-5 rounded-xl !bg-primary px-10 py-5 ">
          <Skeleton className="mx-auto h-12 w-32 !bg-blue-200" />
          <Skeleton className="mx-auto h-6 w-14 !bg-blue-200" />
          <Skeleton className="mx-auto h-4 w-28 !bg-blue-200 text-xl font-medium" />
          <Skeleton className="mx-auto h-4 w-20 !bg-blue-200 text-center text-xl font-medium" />
        </Skeleton>
      </div>
      <div className="flex w-full justify-evenly bg-white pb-4 dark:bg-darkSecondary">
        <Skeleton className="h-10 w-10 rounded-full bg-slate-200 dark:bg-dark_accent" />
        <Skeleton className="h-10 w-10 rounded-full bg-slate-200 dark:bg-dark_accent" />
      </div>
    </div>
  );
}
