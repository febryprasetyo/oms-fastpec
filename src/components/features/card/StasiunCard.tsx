import Link from "next/link";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IoTimeOutline, IoWarningOutline } from "react-icons/io5";

type Props = {
  name: string;
  id: string;
  imgUrl?: string;
  city: string;
  time: string;
  status: "hidup" | "mati";
  ikaScore?: number;
  paramDominan?: string;
  lastUpdate?: string;
};

export default function StasiunCard({
  name,
  id,
  time,
  status,
  ikaScore = 0,
  paramDominan,
}: Props) {
  const isAlive = status === "hidup";

  // Normalize IKA status message/color
  const getIkaStatus = (score: number) => {
    if (score <= 1.0) return { label: "Baik", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (score <= 5.0) return { label: "Cemar Ringan", color: "text-yellow-600 bg-yellow-50 border-yellow-100" };
    if (score <= 10.0) return { label: "Cemar Sedang", color: "text-orange-600 bg-orange-50 border-orange-100" };
    return { label: "Cemar Berat", color: "text-red-600 bg-red-50 border-red-100" };
  };

  const ikaStatus = getIkaStatus(ikaScore);

  return (
    <Link
      href={`/monitoring/${id}`}
      data-testid="station-card"
      onClick={() => {
        if (typeof window !== "undefined") {
          localStorage.setItem(`station_name_${id}`, name);
        }
      }}
      className="block h-full"
    >
      <div
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] dark:bg-darkSecondary dark:shadow-none"
      >
        {/* Top Status Decoration */}
        <div className={`h-1.5 w-full ${isAlive ? "bg-emerald-500" : "bg-red-500"}`} />

        <div className="flex flex-1 flex-col p-5">
          {/* Header Info */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-800 dark:text-white">
                {name}
              </h3>
              <p className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400">
                ID: {id}
              </p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isAlive ? "bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500" : "bg-red-50 text-red-500"}`}>
              <HiOutlineLocationMarker className="text-xl" />
            </div>
          </div>

          {/* IKA & Parameter Area */}
          <div className="flex-1">
            {isAlive ? (
              <div className="grid grid-cols-2 gap-4">
                {/* IKA */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">IKA SCORE</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${ikaStatus.color.split(' ')[0]}`}>
                      {ikaScore.toFixed(2)}
                    </span>
                  </div>
                  <div className={`inline-block rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase ${ikaStatus.color}`}>
                    {ikaStatus.label}
                  </div>
                </div>

                {/* Parameter */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">PARAMETER</p>
                  <p className="text-lg font-extrabold text-slate-700 dark:text-slate-200">
                    {paramDominan && paramDominan !== "-" ? paramDominan : "N/A"}
                  </p>
                  <div className="h-5" /> {/* Spacer */}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-4 text-center">
                <div className="mb-2 rounded-full bg-red-50 p-3 text-red-500">
                  <IoWarningOutline className="text-2xl" />
                </div>
                <p className="text-xs font-semibold text-red-500">Koneksi Terputus</p>
                <p className="mt-1 text-[10px] text-slate-400">Data sensor tidak tersedia</p>
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-800">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isAlive ? "text-slate-400" : "text-red-400"}`}>
              {isAlive ? <IoTimeOutline className="text-sm" /> : <IoWarningOutline className="text-sm" />}
              <span className="truncate">{isAlive ? `Update: ${time}` : `Lost: ${time || "Offline"}`}</span>
            </div>
            
            {/* Small status dot indicator */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {isAlive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${isAlive ? "bg-emerald-500" : "bg-red-500"}`}></span>
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isAlive ? "text-emerald-600" : "text-red-600"}`}>
                {isAlive ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
