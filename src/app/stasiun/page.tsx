import { DataTable } from "@/components/features/dataTable/DataTable";
import AddStationModal from "@/components/features/modal/AddStationModal";
import { auth } from "@/lib/auth";
import { getStationTable } from "@/services/api/stationTabel";
import { ColumnDef } from "@tanstack/react-table";
import { redirect } from "next/navigation";

const columns: ColumnDef<StasionData>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nama_stasiun",
    header: "Nama Stasiun",
  },
  {
    accessorKey: "id_mesin",
    header: "ID Mesin",
  },
  {
    accessorKey: "address",
    header: "Alamat",
  },
  {
    accessorKey: "province_name",
    header: "Provinsi",
  },
  {
    accessorKey: "city_name",
    header: "Kota",
  },
];

export default async function page() {
  const session = await auth();

  if (session !== null) {
    const currentTime = new Date().getTime();
    if (session.user.exp > currentTime) {
      redirect("/login");
    }
    const data = await getStationTable(
      session.user.token.access_token as string,
    );

    return (
      <section className="space-y-5">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-3xl font-semibold">Stasiun</h1>
          <AddStationModal />
        </div>
        <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
          {
            <DataTable
              columns={columns}
              data={data.data.values}
              caption="List Stasiun"
            />
          }
        </div>
      </section>
    );
  }
  redirect("/login");
}
