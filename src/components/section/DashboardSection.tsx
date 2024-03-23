import { getStationList } from "@/services/api/station";
import React, { Suspense } from "react";
import StasiunCard from "../features/card/StasiunCard";
import { auth } from "@/lib/auth";
import CardSkeleton from "../features/skeleton/CardSkeleton";
import dynamic from "next/dynamic";
const UnAuthorizedModal = dynamic(
  () => import("../features/modal/UnAuthorizedModal"),
  {
    ssr: false,
  },
);

type Props = {};

// Metode caching next js bisa diatur sesuai kebutuhan
export const fetchCache = "force-cache";
// 'auto' | 'default-cache' | 'only-cache'
// 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'

export const revalidate = 30; // Revalidate data page ini setiap 30 detik bisa diganti sesuai kebutuhan

export default async function DashboardSection({}: Props) {
  const session = await auth();
  const accessToken = session?.user.token.access_token;
  const stationData = await getStationList(accessToken as string);

  return (
    <>
      {stationData.statusCode === 401 ? (
        <UnAuthorizedModal />
      ) : (
        <section>
          <h1 className="text-3xl font-semibold">List Stasiun</h1>
          <div className="grid w-full grid-cols-1 gap-5 py-6 md:grid-cols-2 xl:grid-cols-3">
            {stationData ? (
              stationData?.data.values.map((station: StationTableData) => {
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
                  Data tidak ditemukan, silahkan coba lagi atau hubungi admin
                  untuk informasi lebih lanjut
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
