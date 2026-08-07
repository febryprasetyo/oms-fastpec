"use client";
import React from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Wifi, Thermometer, CheckCircle2, Droplets, Waves, FlaskConical, Filter, Wind, Zap, TestTube2, ArrowDown } from "lucide-react";
import Klhk from "@/assets/img/logo-lhk.png";
import Logo from "@/assets/img/logo.png";
import { MonitoringData } from "./MonitoringSection";
import SensorRowCard from "@/components/features/monitoring/SensorRowCard";

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

export default function MonitoringMobileView({
  monitoringData,
  isLoaded,
  isOffline,
  date,
  stationName,
  id,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-100 pb-10 lg:hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center">
              <Image src={Klhk} alt="Logo" width={32} height={32} />
            </div>
            <div className="h-6 border-l-2 border-slate-300"></div>
            <div className="flex items-center justify-center">
              <Image src={Logo} alt="Logo" width={0} height={32} />
            </div>
          </div>
          <div className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white">
            {stationName || id}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md">
        {/* Date & Temperature Cards */}
        <section className="grid grid-cols-2 gap-3 p-4">
          <div className="flex flex-col justify-center rounded-lg bg-blue-600 p-3 text-center text-white shadow-sm">
            {isLoaded ? (
              <>
                <span className="text-4xl font-bold">{date.getDate()}</span>
                <span className="text-xs font-medium uppercase opacity-90">
                  {date.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <div className="mt-1 border-t border-blue-500 pt-1 font-mono text-xs">
                  {date.toLocaleTimeString("id-ID")}
                </div>
              </>
            ) : (
              <Skeleton className="h-20 w-full bg-blue-500" />
            )}
          </div>

          <div className="relative flex flex-col justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
            <div className="absolute right-0 top-0 p-2 text-red-500">
              <Thermometer className="h-4 w-4" />
            </div>
            {isLoaded && monitoringData.Temperature !== undefined ? (
              <>
                <span className="text-xs uppercase tracking-widest text-slate-400">
                  Suhu
                </span>
                <span className="text-3xl font-black text-slate-800">
                  {safeToFixed(monitoringData.Temperature)}
                </span>
                <span className="text-sm text-slate-500">°C</span>
              </>
            ) : (
              <Skeleton className="h-20 w-full bg-slate-200" />
            )}
          </div>
        </section>

        {/* Status Card */}
        <section className="mb-4 px-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
              <h3 className="text-xs font-bold uppercase text-slate-500">
                System Control & Status
              </h3>
              <Wifi className="h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-4 p-4">
              {/* Status Koneksi */}
              <div>
                <p className="mb-1 text-[10px] font-bold text-slate-400">
                  STATUS KONEKSI
                </p>
                {isLoaded ? (
                  <div className="grid grid-cols-3 gap-2">
                    {["Data Logger", "PLC", "Server"].map((item) => (
                      <div
                        key={item}
                        className={`rounded border py-1.5 text-center text-[10px] font-bold ${
                          !isOffline
                            ? "border-blue-100 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-slate-100 text-slate-400"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-8 w-full bg-slate-200" />
                    ))}
                  </div>
                )}
              </div>

              {/* Control */}
              <div>
                <p className="mb-1 text-[10px] font-bold text-slate-400">
                  CONTROL
                </p>
                {isLoaded ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Pump", status: monitoringData.Pump_Status },
                      { label: "CV", status: monitoringData.CV_Status },
                      { label: "State", status: monitoringData.Read_Status },
                    ].map((item) => (
                      <button
                        key={item.label}
                        className={`rounded py-2 text-center text-[11px] font-bold shadow transition-colors ${
                          item.status
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-600 text-white hover:bg-slate-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full bg-slate-200" />
                    ))}
                  </div>
                )}
              </div>

              {/* Status Sensor */}
              <div>
                <p className="mb-1 text-[10px] font-bold text-slate-400">
                  STATUS SENSOR
                </p>
                {isLoaded ? (
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Multiparameter", status: monitoringData.Y4000_Status },
                      { label: "UV 254", status: monitoringData.UV254_Status },
                      { label: "Amonia", status: monitoringData.NH4_Status },
                      { label: "Level", status: monitoringData.Depth_Status },
                      { label: "NO3", status: monitoringData.NO3_Status },
                      ...((monitoringData.ORP ?? 0) !== 0 
                        ? [{ label: "NO2", status: monitoringData.NO2_Status }] 
                        : []
                      ),
                    ].map((sensor) => (
                      <span
                        key={sensor.label}
                        className={`rounded-full border px-2 py-1 text-[10px] font-bold flex items-center ${
                          sensor.status === 'on'
                            ? "border-green-200 bg-green-100 text-green-700"
                            : "border-slate-200 bg-slate-100 text-slate-400"
                        }`}
                      >
                        {sensor.status === 'on' && (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {sensor.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton
                        key={i}
                        className="h-6 w-24 rounded-full bg-slate-200"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Realtime Parameters */}
        <section className="px-4">
          <h3 className="mb-3 flex items-end justify-between px-1 text-sm font-bold text-slate-800">
            <span>Realtime Parameters</span>
          </h3>

          {!isLoaded ? (
            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-20 bg-slate-200" />
                    <Skeleton className="h-3 w-32 bg-slate-200" />
                  </div>
                  <Skeleton className="h-6 w-16 bg-slate-200" />
                </div>
              ))}
            </div>
          ) : isOffline ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm">
              <div className="rounded-full bg-red-100 p-6">
                <AlertTriangle className="h-12 w-12 text-red-500" />
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
            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {/* DO */}
              <SensorRowCard
                label="DO"
                subLabel="Dissolved Oxygen"
                value={safeToFixed(monitoringData.DO)}
                unit="mg/L"
                Icon={Droplets}
                iconClassName="bg-blue-50 text-blue-600"
              />

              {/* TURBIDITY */}
              <SensorRowCard
                label="TURBIDITY"
                subLabel="Kekeruhan"
                value={safeToFixed(monitoringData.TUR)}
                unit="NTU"
                Icon={Waves}
                iconClassName="bg-teal-50 text-teal-600"
              />

              {/* TDS */}
              <SensorRowCard
                label="TDS"
                subLabel="Total Dissolved Solids"
                value={safeToFixed(monitoringData.CT)}
                unit="ppm"
                Icon={Waves}
                iconClassName="bg-cyan-50 text-cyan-600"
              />

              {/* pH */}
              <SensorRowCard
                label="pH"
                subLabel="Acidity"
                value={safeToFixed(monitoringData.PH)}
                unit="pH"
                Icon={FlaskConical}
                iconClassName="bg-purple-50 text-purple-600"
              />

              {/* BOD & COD Grid */}
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="flex flex-col items-center p-4 text-center">
                  <span className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                    BOD
                  </span>
                  <span className="text-xl font-black text-slate-800">
                    {safeToFixed(monitoringData.BOD)}
                  </span>
                  <span className="text-[10px] text-slate-500">mg/L</span>
                </div>
                <div className="flex flex-col items-center p-4 text-center">
                  <span className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                    COD
                  </span>
                  <span className="text-xl font-black text-slate-800">
                    {safeToFixed(monitoringData.COD)}
                  </span>
                  <span className="text-[10px] text-slate-500">mg/L</span>
                </div>
              </div>

              {/* TSS */}
              <SensorRowCard
                label="TSS"
                subLabel="Suspended Solids"
                value={safeToFixed(monitoringData.TSS)}
                unit="mg/L"
                Icon={Filter}
                iconClassName="bg-orange-50 text-orange-600"
              />

              {/* AMONIA */}
              <SensorRowCard
                label="AMONIA"
                subLabel="NH4"
                value={safeToFixed(monitoringData.N)}
                unit="mg/L"
                Icon={Wind}
                iconClassName="bg-red-50 text-red-600"
              />

              {/* DEPTH */}
              <SensorRowCard
                label="DEPTH"
                subLabel="Water Level"
                value={safeToFixed(monitoringData.DEPTH)}
                unit="m"
                Icon={ArrowDown}
                iconClassName="bg-blue-50 text-blue-600"
              />

              {/* NO3 */}
              <SensorRowCard
                label="NO3"
                subLabel="Nitrate"
                value={safeToFixed(monitoringData["NO3-3"])}
                unit="mg/L"
                Icon={TestTube2}
                iconClassName="bg-emerald-50 text-emerald-600"
              />

              {/* ORP & NO2 if available */}
              {(monitoringData.ORP ?? 0) !== 0 && (
                <>
                  <SensorRowCard
                    label="ORP"
                    subLabel="Oxidation Reduction"
                    value={safeToFixed(monitoringData.ORP)}
                    unit="mg/L"
                    Icon={Zap}
                    iconClassName="bg-indigo-50 text-indigo-600"
                  />

                  <SensorRowCard
                    label="NO2"
                    subLabel="Nitrite"
                    value={safeToFixed(monitoringData.NO2)}
                    unit="mg/L"
                    Icon={TestTube2}
                    iconClassName="bg-pink-50 text-pink-600"
                  />
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
