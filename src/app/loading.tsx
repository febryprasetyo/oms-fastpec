import CardSkeleton from "@/components/features/skeleton/CardSkeleton";

export default function Loading() {
  return (
    <section>
      <h1 className="text-3xl font-semibold">List Stasiun</h1>
      <div className="grid w-full grid-cols-1 gap-5 py-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
