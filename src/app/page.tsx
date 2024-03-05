import StasiunCard from "@/components/features/card/StasiunCard";
import { auth } from "@/lib/auth";
import { getStasionList } from "@/services/api/stasionList";
import { redirect } from "next/navigation";

// Metode caching next js bisa diatur sesuai kebutuhan
export const fetchCache = "force-cache";
// 'auto' | 'default-cache' | 'only-cache'
// 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'

export const revalidate = 30; // Revalidate data page ini setiap 60 detik bisa diganti sesuai kebutuhan

export default async function Home() {
  const session = await auth();
  const stasion = await getStasionList(
    session?.user?.token?.access_token as string,
  );

  if (session !== null) {
    return (
      <>
        <section>
          <h1 className="text-3xl font-semibold">List Stasiun</h1>
          <div className="grid w-full grid-cols-1 gap-5 py-6 md:grid-cols-2 xl:grid-cols-3">
            {stasion.success ? (
              stasion.data.map((stasiun) => (
                <StasiunCard
                  key={stasiun.device_id}
                  name={stasiun.nama_dinas}
                  id={stasiun.id_mesin}
                  imgUrl="https://images.unsplash.com/photo-1495774539583-885e02cca8c2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
              ))
            ) : (
              <div className="col-start-1 col-end-5 mt-20 w-full text-center">
                <p className="text-2xl text-slate-700">
                  Stasiun tidak ditemukan
                </p>
              </div>
            )}
          </div>
        </section>
      </>
    );
  }
  redirect("/login");
}
