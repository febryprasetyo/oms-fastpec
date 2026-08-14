"use client";

import React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useCalibrationAuth, useCreateCalibration, useParameters, useStations } from "@/hook/useCalibration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCalibrationDateInput, formatCalibrationParameterName } from "@/lib/calibration-format";

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
  const matchingStations = useMemo(() => stations.filter((station) => station.name.toLowerCase().includes(stationSearch.toLowerCase())).slice(0, 8), [stationSearch, stations]);

  const toggleParameter = (id: string) => setParameterIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const createDraft = async () => {
    if (!stationId) return toast.error("Stasiun wajib dipilih.");
    if (!startDate || !endDate || endDate < startDate) return toast.error("Rentang tanggal kalibrasi tidak valid.");
    if (parameterIds.length === 0) return toast.error("Pilih minimal satu parameter.");
    try {
      const created = await createMutation.mutateAsync({
        station_id: Number(stationId), calibration_start_date: startDate,
        calibration_end_date: endDate, parameter_ids: parameterIds.map(Number),
      });
      toast.success("Draf kalibrasi berhasil dibuat.");
      router.push(`/calibration/edit/${created.id}`);
    } catch { /* interceptor displays the backend message */ }
  };

  return <div className="mx-auto max-w-5xl space-y-6 p-6">
    <div><h1 className="text-2xl font-bold">Buat Draf Kalibrasi</h1><p className="text-sm text-muted-foreground">Petugas: {officerName}. Metadata laporan dan standar akan dibuat secara otomatis.</p></div>
    <Card><CardHeader><CardTitle>Informasi Kalibrasi</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2"><Label>Stasiun</Label><Input value={stationSearch} onChange={(event) => { setStationSearch(event.target.value); setStationId(""); }} placeholder="Cari stasiun..." />
        {!stationId && stationSearch && <div className="max-h-48 overflow-auto rounded-md border bg-background p-1">{stationsLoading ? <p className="p-2 text-sm">Memuat...</p> : matchingStations.map((station) => <button type="button" key={station.id} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => { setStationId(station.id); setStationSearch(station.name); }}>{station.name}</button>)}</div>}
      </div>
      <div className="space-y-2"><Label>Tanggal Mulai</Label><Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></div>
      <div className="space-y-2"><Label>Tanggal Selesai</Label><Input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></div>
      <div className="space-y-2"><Label>Alamat</Label><Input readOnly value={selectedStation?.address ?? ""} /></div>
      <div className="space-y-2"><Label>Koordinat</Label><Input readOnly value={selectedStation ? `${selectedStation.latitude}, ${selectedStation.longitude}` : ""} /></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Parameter</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{parametersLoading ? <p className="text-sm text-muted-foreground">Memuat data parameter...</p> : parameters.map((parameter) => { const selected = parameterIds.includes(parameter.id); return <button key={parameter.id} type="button" onClick={() => toggleParameter(parameter.id)} className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm ${selected ? "border-primary bg-primary/5" : "hover:bg-muted"}`}>{selected ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground" />}<span>{formatCalibrationParameterName(parameter.name)}</span></button>; })}</CardContent></Card>
    <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => router.back()}>Batal</Button><Button disabled={createMutation.isPending} onClick={() => void createDraft()}>{createMutation.isPending ? "Membuat..." : "Buat Draf"}</Button></div>
  </div>;
}
