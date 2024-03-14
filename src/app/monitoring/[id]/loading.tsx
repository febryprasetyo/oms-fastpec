import MonitoringCardSkeleton from "@/components/features/skeleton/MonitoringCardSkeleton";

export default function Loading() {
  return (
    <main className={`px-5 py-5 transition-all sm:px-10`}>
      <section>
        <div className="grid grid-cols-1 gap-5 py-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
          {Array.from({ length: 13 }).map((_, index) => (
            <MonitoringCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
