import { getStationList } from "@/services/api/station";
import React, { Suspense } from "react";
import StasiunCard from "../features/card/StasiunCard";
import CardSkeleton from "../features/skeleton/CardSkeleton";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Props = {};
// Metode caching next js bisa diatur sesuai kebutuhan
export const fetchCache = "force-cache";
export const revalidate = 30; // Revalidate data page ini setiap 30 detik bisa diganti sesuai kebutuhan

export default async function DashboardSection({}: Props) {
  const cookie = getCookie("token", { cookies });
  if (!cookie) {
    redirect("/login");
  }
  const stationData = await getStationList(cookie);

  return (
    <section>
      <h1 className="text-3xl font-semibold">List Stasiun</h1>
      <div className="grid w-full grid-cols-1 gap-5 py-6 md:grid-cols-2 xl:grid-cols-3">
        {stationData?.data?.values ? (
          stationData.data.values.map((station: StationTableData) => {
            return (
              <Suspense fallback={<CardSkeleton />} key={station.id}>
                <StasiunCard
                  province={station.province_name}
                  city={station.city_name}
                  id={station.id_mesin}
                  name={station.nama_stasiun}
                  imgUrl="https://images.unsplash.com/photo-1495774539583-885e02cca8c2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
              </Suspense>
            );
          })
        ) : (
          <div
            className="col-start-1 col-end-4 w-full py-20 text-center
          "
          >
            <p className="text-xl font-medium">
              Data tidak ditemukan, silahkan coba lagi atau hubungi admin untuk
              informasi lebih lanjut
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
