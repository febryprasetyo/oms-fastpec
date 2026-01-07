"use client";
import React from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import Klhk from "@/assets/img/logo-lhk.png";
import Logo from "@/assets/img/logo.png";
import { MonitoringData } from "./MonitoringSection";

const safeToFixed = (value: any): string => {
  const num = Number(value);
  return !isNaN(num) ? num.toFixed(2) : "0.00";
};

type Props = {
  monitoringData: MonitoringData;
  isLoaded: boolean;
  isOffline: boolean;
  date: Date;
  stationName: string;
  id: string;
};

const sensorCards = [
  {
    key: "DO",
    title: "DISSOLVED OXYGEN",
    icon: "fa-droplet",
    getValue: (data: MonitoringData) => safeToFixed(data.DO),
    getRawValue: (data: MonitoringData) => data.DO ?? 0,
    getStatus: (data: MonitoringData) => data.Status_DO,
    unit: "mg/L",
  },
  {
    key: "TUR",
    title: "TURBIDITY",
    icon: "fa-tint",
    getValue: (data: MonitoringData) => safeToFixed(data.TUR),
    getRawValue: (data: MonitoringData) => data.TUR ?? 0,
    getStatus: (data: MonitoringData) => data.Status_TUR,
    unit: "NTU",
  },
  {
    key: "CT",
    title: "TDS",
    icon: "fa-water",
    getValue: (data: MonitoringData) => safeToFixed(data.CT),
    getRawValue: (data: MonitoringData) => data.CT ?? 0,
    getStatus: (data: MonitoringData) => data.Status_CT,
    unit: "ppm",
  },
  {
    key: "PH",
    title: "ACIDITY (pH)",
    icon: "fa-flask",
    getValue: (data: MonitoringData) => safeToFixed(data.PH),
    getRawValue: (data: MonitoringData) => data.PH ?? 0,
    getStatus: (data: MonitoringData) => data.Status_PH,
    unit: "pH Level",
  },
  {
    key: "BOD",
    title: "BOD",
    icon: "fa-bacteriophage",
    getValue: (data: MonitoringData) => safeToFixed(data.BOD),
    getRawValue: (data: MonitoringData) => data.BOD ?? 0,
    getStatus: (data: MonitoringData) => data.Status_BOD,
    unit: "mg/L",
  },
  {
    key: "COD",
    title: "COD",
    icon: "fa-vial",
    getValue: (data: MonitoringData) => safeToFixed(data.COD),
    getRawValue: (data: MonitoringData) => data.COD ?? 0,
    getStatus: (data: MonitoringData) => data.Status_COD,
    unit: "mg/L",
  },
  {
    key: "N",
    title: "AMONIA",
    icon: "fa-wind",
    getValue: (data: MonitoringData) => safeToFixed(data.N),
    getRawValue: (data: MonitoringData) => data.N ?? 0,
    getStatus: (data: MonitoringData) => data.Status_N,
    unit: "mg/L",
  },
  {
    key: "TSS",
    title: "TSS",
    icon: "fa-filter",
    getValue: (data: MonitoringData) => safeToFixed(data.TSS),
    getRawValue: (data: MonitoringData) => data.TSS ?? 0,
    getStatus: (data: MonitoringData) => data.Status_TSS,
    unit: "mg/L",
  },
  {
    key: "DEPTH",
    title: "DEPTH",
    icon: "fa-ruler-vertical",
    getValue: (data: MonitoringData) => safeToFixed(data.DEPTH),
    getRawValue: (data: MonitoringData) => data.DEPTH ?? 0,
    getStatus: (data: MonitoringData) => data.Status_DEPTH,
    unit: "Meters",
  },
  {
    key: "NO3",
    title: "NITRATE (NO3)",
    icon: "fa-atom",
    getValue: (data: MonitoringData) => safeToFixed(data["NO3-3"]),
    getRawValue: (data: MonitoringData) => data["NO3-3"] ?? 0,
    getStatus: (data: MonitoringData) => data.Status_NO3_3,
    unit: "mg/L",
  },
];

const getSensorStatus = (value: number | undefined | null) => {
  if (value === -1) return "MAINTENANCE";
  if (value === -2) return "CALIBRATION";
  if (value === -3) return "OFFLINE";
  return "ACTIVE";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "MAINTENANCE": return "bg-amber-500";
    case "CALIBRATION": return "bg-cyan-500";
    case "OFFLINE": return "bg-slate-400";
    default: return "bg-blue-600";
  }
};

export default function MonitoringDesktopView({
  monitoringData,
  isLoaded,
  isOffline,
  date,
  stationName,
  id,
}: Props) {
  return (
    <div className="hidden h-screen overflow-hidden bg-slate-100 lg:flex">
      {/* Sidebar */}
      <aside className="z-20 flex h-full w-80 flex-col border-r border-slate-200 bg-white shadow-lg">
        {/* Logo Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 p-6">
          <div className="flex items-center justify-center">
            <Image src={Klhk} alt="Logo KLHK" width={40} height={40} className="object-contain" />
          </div>
          <div className="flex items-center justify-center">
            <Image src={Logo} alt="Logo Fastpec" width={120} height={40} className="object-contain" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Date & Temperature Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-slate-800 p-5 text-white shadow-lg">
            <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
              <i className="fas fa-cloud-sun text-6xl"></i>
            </div>

            {isLoaded ? (
              <>
                <div className="relative z-10 mb-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                    Tanggal
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{date.getDate()}</span>
                    <div className="pb-1 text-sm leading-tight">
                      <p className="font-semibold">
                        {date.toLocaleDateString("id-ID", { month: "long" })}
                      </p>
                      <p className="opacity-80">
                        {date.toLocaleDateString("id-ID", { year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 inline-block rounded bg-slate-700/50 px-2 py-1 font-mono text-xs text-slate-300">
                    {date.toLocaleTimeString("id-ID")} WIB
                  </div>
                </div>

                <div className="relative z-10 border-t border-slate-700 pt-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                    Suhu Air
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-blue-400">
                      {safeToFixed(monitoringData.Temperature)}
                    </span>
                    <span className="text-lg opacity-80">°C</span>
                  </div>
                </div>
              </>
            ) : (
              <Skeleton className="h-40 w-full bg-slate-700" />
            )}
          </div>

          { /* Indeks IKA Card */ }
          <div className={`group relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
            (() => {
              const ika = monitoringData.IKA ?? 0;
              if (ika <= 1.0) return "bg-emerald-600";
              if (ika <= 5.0) return "bg-yellow-600";
              if (ika <= 10.0) return "bg-orange-600";
              return "bg-red-600";
            })()
          }`}>
             <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
               <i className="fas fa-leaf text-6xl"></i>
             </div>
             <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-100">
               Indeks IKA
             </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  {safeToFixed(monitoringData.IKA)}
                </span>
                <span className="text-sm opacity-80">pts</span>
              </div>
              <div className="mt-2 text-xs text-emerald-100 opacity-80">
                Status: {(() => {
                  const ika = monitoringData.IKA ?? 0;
                  if (ika <= 1.0) return "Memenuhi Baku Mutu";
                  if (ika <= 5.0) return "Cemar Ringan";
                  if (ika <= 10.0) return "Cemar Sedang";
                  return "Cemar Berat";
                })()}
              </div>
              
              {/* Dominant Parameter Info */}
              {(monitoringData.IKA_Param && monitoringData.IKA_Param !== "-") && (
                 <div className="mt-1 border-t border-white/20 pt-1 text-[10px] text-white/90">
                    <span className="font-semibold opacity-75">Param Dominan:</span>
                    <div className="flex items-center justify-between font-bold">
                       <span className="capitalize">{monitoringData.IKA_Param}</span>
                       <span>idx: {safeToFixed(monitoringData.IKA_Value)}</span>
                    </div>
                 </div>
              )}
           </div>

          {/* Status Koneksi */}
          <div>
            <h3 className="mb-3 pl-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Koneksi
            </h3>
            <div className="space-y-2">
              {isLoaded ? (
                <>
                  {[
                    { label: "Data Logger", icon: "fa-wifi" },
                    { label: "PLC System", icon: "fa-microchip" },
                    { label: "Server", icon: "fa-server" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            !isOffline ? "animate-pulse bg-emerald-500" : "bg-slate-400"
                          }`}
                        ></div>
                        <span className="text-sm font-semibold text-slate-700">
                          {item.label}
                        </span>
                      </div>
                      <i className={`fas ${item.icon} text-xs text-slate-300`}></i>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-slate-200" />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div>
            <h3 className="mb-3 pl-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Control Panel
            </h3>
            {isLoaded ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "PUMP", icon: "fa-power-off", status: monitoringData.Pump_Status },
                  { label: "CV", icon: "fa-sliders-h", status: monitoringData.CV_Status },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={`group flex flex-col items-center gap-1 rounded-lg border py-3 text-sm font-bold shadow-sm transition-all ${
                      item.status
                        ? "border-blue-500 bg-blue-600 text-white shadow-blue-200"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    <i
                      className={`fas ${item.icon} text-lg transition-transform group-hover:scale-110 ${
                        item.status ? "text-white" : "text-slate-300"
                      }`}
                    ></i>
                    {item.label}
                  </button>
                ))}
                <button
                  className={`col-span-2 rounded-lg py-3 text-sm font-bold shadow-md transition-all ${
                    monitoringData.Read_Status
                      ? "bg-slate-800 text-white hover:bg-slate-900"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  READ STATE
                </button>

                {/* Control Menu Actions */}
                <div className="col-span-2 mt-1 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  <button className="group flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-[10px] font-bold text-slate-500 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                    <i className="fas fa-stop-circle mb-1 text-lg text-slate-300 transition-colors group-hover:text-red-500"></i>
                    STOP
                  </button>
                  <button className="group flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-[10px] font-bold text-slate-500 shadow-sm transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600">
                    <i className="fas fa-tools mb-1 text-lg text-slate-300 transition-colors group-hover:text-amber-500"></i>
                    MAINT
                  </button>
                  <button className="group flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-[10px] font-bold text-slate-500 shadow-sm transition-all hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600">
                    <i className="fas fa-crosshairs mb-1 text-lg text-slate-300 transition-colors group-hover:text-cyan-500"></i>
                    CALIB
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full bg-slate-200" />
                <Skeleton className="h-16 w-full bg-slate-200" />
                <Skeleton className="col-span-2 h-12 w-full bg-slate-200" />
              </div>
            )}
          </div>

          {/* Sensor Check (Mini Status) */}
          <div>
            <h3 className="mb-3 pl-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Sensor Check
            </h3>
            {isLoaded ? (
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Multi", status: monitoringData.Y4000_Status },
                  { label: "UV254", status: monitoringData.UV254_Status },
                  { label: "NH4", status: monitoringData.NH4_Status },
                  { label: "Level", status: monitoringData.Depth_Status },
                  { label: "NO3", status: monitoringData.NO3_Status },
                ].map((sensor) => (
                  <span
                    key={sensor.label}
                    className={`flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      sensor.status === 'on'
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-slate-100 text-slate-400"
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${sensor.status === 'on' ? "bg-blue-500" : "bg-slate-400"}`}></div>
                    {sensor.label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-6 w-16 bg-slate-200" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase text-slate-400">
            Stasiun ID
          </p>
          <p className="text-sm font-bold text-slate-800">
            {stationName || id}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-slate-50/50">
        <div className="absolute left-0 top-0 -z-10 h-64 w-full bg-gradient-to-b from-white to-transparent"></div>

        {/* Header */}
        <header className="z-10 flex items-center justify-between px-8 py-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800">
              ONLINE MONITORING SYSTEM
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Real-time water quality analysis dashboard
            </p>
          </div>
        </header>

        {/* Sensor Cards Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {!isLoaded ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
                >
                  <Skeleton className="h-48 w-full bg-slate-200" />
                  <Skeleton className="h-12 w-full bg-slate-300" />
                </div>
              ))}
            </div>
          ) : isOffline ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-slate-100 p-6">
                <AlertTriangle className="h-12 w-12 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">
                  Mesin Offline
                </h3>
                <p className="max-w-md text-slate-500">
                  Tidak dapat terhubung ke perangkat. Mohon periksa koneksi
                  internet atau pastikan mesin dalam keadaan menyala.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
                {sensorCards.map((sensor) => {
                  const rawValue = sensor.getRawValue(monitoringData);
                  
                  // Get status from API (Status_...) or fallback to value-based logic
                  let apiStatus = sensor.getStatus(monitoringData);
                  let status = apiStatus || getSensorStatus(rawValue);

                  // Normalize "NORMAL" to "ACTIVE" for display logic
                  if (status === "NORMAL") status = "ACTIVE";
                  
                  const isActive = status === "ACTIVE";
                  const statusColor = getStatusColor(status);
                  const isSpecialState = status === "MAINTENANCE" || status === "CALIBRATION";
                  
                  return (
                    <div
                      key={sensor.key}
                      className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 ${
                        isActive 
                          ? "border-blue-100 hover:-translate-y-1 hover:shadow-md" 
                          : isSpecialState
                            ? "border-slate-100 hover:-translate-y-1 hover:shadow-md"
                            : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <div className="relative flex h-48 flex-col items-center justify-center p-6">
                        {/* Icon Background */}
                        <div
                          className={`absolute right-4 top-4 transition-colors ${
                            isActive ? "text-blue-500 opacity-20" : "text-slate-300 opacity-10"
                          }`}
                        >
                          <i className={`fas ${sensor.icon} text-5xl`}></i>
                        </div>
                        
                        {/* Value Display */}
                        {isSpecialState ? (
                           <div className="flex flex-col items-center justify-center gap-2 text-center animate-pulse">
                              <div className={`p-3 rounded-full ${
                                 status === "MAINTENANCE" ? "bg-amber-100 text-amber-500" : "bg-cyan-100 text-cyan-500"
                              }`}>
                                 <i className={`fas ${status === "MAINTENANCE" ? "fa-tools" : "fa-crosshairs"} text-3xl`}></i>
                              </div>
                              <span className={`text-sm font-bold uppercase tracking-wider ${
                                 status === "MAINTENANCE" ? "text-amber-500" : "text-cyan-500"
                              }`}>
                                 {status}
                              </span>
                           </div>
                        ) : (
                           <div className={`flex flex-col items-center transition-all duration-300 ${!isActive ? "blur-sm opacity-30 scale-90" : ""}`}>
                             <h3 className={`mb-1 text-4xl font-black tracking-tight ${
                               isActive ? "text-slate-800" : "text-slate-400"
                             }`}>
                               {safeToFixed(rawValue)}
                             </h3>
                             <p className={`text-sm font-bold uppercase tracking-wider ${
                               isActive ? "text-blue-600" : "text-slate-400"
                             }`}>
                               {sensor.unit}
                             </p>
                           </div>
                        )}

                        {/* Status Badge Overlay (Only for Offline/Inactive, not for special states as they are already full card) */}
                        {!isActive && !isSpecialState && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="rounded border border-slate-200 bg-white px-3 py-1 text-xs font-bold tracking-widest text-slate-400 shadow-sm">
                              {status}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Status Bar */}
                      <div
                        className={`flex items-center justify-between px-4 py-3 ${
                           status === "MAINTENANCE" ? "bg-amber-500" :
                           status === "CALIBRATION" ? "bg-cyan-500" :
                           isActive ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      >
                        <span className={`text-xs font-bold tracking-[0.15em] ${
                          isActive || isSpecialState ? "text-white" : "text-slate-400"
                        }`}>
                          {sensor.title}
                        </span>
                        <div className={`h-2 w-2 rounded-full ${
                          isActive || isSpecialState ? "bg-white animate-pulse" : "bg-slate-400"
                        }`}></div>
                      </div>
                    </div>
                  );
                })}

                {/* ORP & NO2 if available */}
                {(monitoringData.ORP ?? 0) !== 0 && (
                  <>
                    <div className="group overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className="relative flex h-48 flex-col items-center justify-center p-6">
                        <div className="absolute right-4 top-4 text-blue-500 opacity-20 transition-colors">
                          <i className="fas fa-bolt text-5xl"></i>
                        </div>
                        <h3 className="mb-1 text-4xl font-black tracking-tight text-slate-800">
                          {safeToFixed(monitoringData.ORP)}
                        </h3>
                        <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                          mg/L
                        </p>
                      </div>
                      <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
                        <span className="text-xs font-bold tracking-[0.15em] text-white">
                          ORP
                        </span>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                      </div>
                    </div>

                    <div className="group overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className="relative flex h-48 flex-col items-center justify-center p-6">
                        <div className="absolute right-4 top-4 text-blue-500 opacity-20 transition-colors">
                          <i className="fas fa-atom text-5xl"></i>
                        </div>
                        <h3 className="mb-1 text-4xl font-black tracking-tight text-slate-800">
                          {safeToFixed(monitoringData.NO2)}
                        </h3>
                        <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                          mg/L
                        </p>
                      </div>
                      <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
                        <span className="text-xs font-bold tracking-[0.15em] text-white">
                          NITRITE (NO2)
                        </span>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-10 text-center text-xs text-slate-400">
                © 2025 FASTPEC Monitoring Systems. All rights reserved.
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
