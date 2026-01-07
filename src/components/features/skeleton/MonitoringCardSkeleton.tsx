import { Skeleton } from "@/components/ui/skeleton";

export default function MonitoringCardSkeleton() {
  return (
    <div className="flex w-full flex-col items-center justify-between overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="grid w-full grid-cols-2">
        {/* Icon Placeholder */}
        <div className="flex h-32 flex-col items-center justify-center bg-slate-100 p-2">
          <Skeleton className="h-20 w-20 rounded-full bg-slate-300" />
        </div>
        {/* Value & Unit Placeholder */}
        <div className="flex w-full flex-col items-center justify-center bg-slate-100 py-0">
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <Skeleton className="h-10 w-24 bg-slate-300" />
            <Skeleton className="h-5 w-12 bg-slate-300" />
          </div>
        </div>
      </div>
      {/* Title Placeholder */}
      <div className="flex w-full justify-center bg-primary py-3">
        <Skeleton className="h-8 w-32 bg-blue-400/50" />
      </div>
    </div>
  );
}
