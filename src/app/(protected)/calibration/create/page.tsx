"use client";

import React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FilePlus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useCalibrationAuth, useCreateCalibration, useParameters, useStations } from "@/hook/useCalibration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCalibrationDateInput, formatCalibrationParameterName } from "@/lib/calibration-format";
import { cn } from "@/lib/utils";

const today = () => formatCalibrationDateInput(new Date());

export default function CreateCalibrationPage() {
  const router = useRouter();
  const { officerName } = useCalibrationAuth();
  const { data: stations = [], isLoading: stationsLoading } = useStations();
  const { data: parameters = [], isLoading: parametersLoading } = useParameters();
  const createMutation = useCreateCalibration();
  const [stationId, setStationId] = useState("");
  const [stationSearch, setStationSearch] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [parameterIds, setParameterIds] = useState<string[]>([]);
  const selectedStation = stations.find((station) => station.id === stationId);
  const matchingStations = useMemo(
    () => stations.filter((station) => station.name.toLowerCase().includes(stationSearch.toLowerCase())).slice(0, 8),
    [stationSearch, stations]
  );

  const toggleParameter = (id: string) =>
    setParameterIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const createDraft = async () => {
    if (!stationId) return toast.error("Stasiun wajib dipilih.");
    if (!startDate || !endDate || endDate < startDate) return toast.error("Rentang tanggal kalibrasi tidak valid.");
    if (parameterIds.length === 0) return toast.error("Pilih minimal satu parameter.");
    try {
      const created = await createMutation.mutateAsync({
        station_id: Number(stationId),
        calibration_start_date: startDate,
        calibration_end_date: endDate,
        parameter_ids: parameterIds.map(Number),
      });
      toast.success("Draf kalibrasi berhasil dibuat.");
      router.push(`/calibration/edit/${created.id}`);
    } catch {
      /* interceptor displays the backend message */
    }
  };

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto space-y-6 pb-12">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FilePlus className="h-6 w-6 text-blue-600" />
          <span>Buat Draf Kalibrasi Baru</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Petugas: <span className="font-semibold text-slate-800">{officerName}</span>. Metadata laporan dan standar akan dibuat secara otomatis.
        </p>
      </div>

      {/* Informasi Stasiun & Tanggal */}
      <Card className="rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b py-3 px-4 sm:px-5">
          <CardTitle className="text-sm font-bold text-slate-800">Informasi Kalibrasi</CardTitle>
        </CardHeader>
        <CardContent className="grid min-w-0 grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 sm:p-5">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700">Pilih Stasiun Pemantauan</Label>
            <Input
              value={stationSearch}
              onChange={(event) => {
                setStationSearch(event.target.value);
                setStationId("");
              }}
              placeholder="Ketik untuk mencari stasiun..."
              className="h-9 text-xs bg-white"
            />
            {!stationId && stationSearch && (
              <div className="max-h-48 overflow-auto rounded-lg border bg-white p-1 shadow-md">
                {stationsLoading ? (
                  <p className="p-2 text-xs text-slate-500">Memuat stasiun...</p>
                ) : (
                  matchingStations.map((station) => (
                    <button
                      type="button"
                      key={station.id}
                      className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
                      onClick={() => {
                        setStationId(station.id);
                        setStationSearch(station.name);
                      }}
                    >
                      {station.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Tanggal Mulai</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-8 text-xs bg-white"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Tanggal Selesai</Label>
            <Input
              type="date"
              min={startDate}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-8 text-xs bg-white"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Alamat Lokasi</Label>
            <Input readOnly value={selectedStation?.address ?? ""} className="h-8 text-xs bg-slate-50" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Koordinat</Label>
            <Input
              readOnly
              value={selectedStation ? `${selectedStation.latitude}, ${selectedStation.longitude}` : ""}
              className="h-8 text-xs bg-slate-50 font-mono text-[11px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Parameter Selection */}
      <Card className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-3 px-4 sm:px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900">Pilih Parameter yang Dikalibrasi</CardTitle>
          <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
            {parameterIds.length} dipilih
          </span>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {parametersLoading ? (
            <p className="text-xs text-slate-500">Memuat data parameter...</p>
          ) : (
            <div className="grid min-w-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {parameters.map((parameter) => {
                const selected = parameterIds.includes(parameter.id);
                return (
                  <button
                    key={parameter.id}
                    type="button"
                    onClick={() => toggleParameter(parameter.id)}
                    className={cn(
                      "flex items-center justify-between h-9 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer",
                      selected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs hover:bg-blue-700"
                        : "bg-slate-100/80 text-slate-700 border-slate-200/90 hover:bg-slate-200/80 hover:border-slate-300"
                    )}
                  >
                    <span className="truncate">{formatCalibrationParameterName(parameter.name)}</span>
                    {selected ? (
                      <Check className="h-3.5 w-3.5 shrink-0 ml-1.5 text-white" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 shrink-0 ml-1.5 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="text-xs font-semibold">
          Batal
        </Button>
        <Button
          size="sm"
          disabled={createMutation.isPending}
          onClick={() => void createDraft()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
        >
          {createMutation.isPending ? "Membuat Draf..." : "Buat Draf Kalibrasi"}
        </Button>
      </div>
    </div>
  );
}
