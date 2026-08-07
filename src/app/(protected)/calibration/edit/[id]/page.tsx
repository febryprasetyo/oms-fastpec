"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalibrationSchema, CalibrationFormValues } from "@/schemas/calibration.schema";
import { useStations, useCalibrationDetail, useUpdateCalibration, useCalibrationAuth } from "@/hook/useCalibration";
import { CalibrationHeader } from "@/components/features/badge/CalibrationHeader";
import { ParameterTable } from "@/components/features/calibration/ParameterTable";
import { WaterSampleTable } from "@/components/features/calibration/WaterSampleTable";
import { NotesEditor } from "@/components/features/calibration/NotesEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditCalibration() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { data: detail, isLoading } = useCalibrationDetail(id);
  const { data: stations } = useStations();
  const updateMutation = useUpdateCalibration();
  const [percentage, setPercentage] = useState(0);

  const form = useForm<CalibrationFormValues>({
    resolver: zodResolver(CalibrationSchema),
  });

  const watchAll = form.watch();

  // Populate data when detail query resolves
  useEffect(() => {
    if (detail) {
      form.reset({
        stationId: detail.stationId,
        stationName: detail.stationName,
        address: detail.address,
        latitude: detail.latitude,
        longitude: detail.longitude,
        calibrationDate: new Date(detail.calibrationDate),
        contactPerson: detail.contactPerson,
        phone: detail.phone,
        officer: detail.officer,
        parameters: detail.parameters,
        waterSamples: detail.waterSamples,
        notes: detail.notes,
      });
    }
  }, [detail]);

  // Progress calculator
  useEffect(() => {
    let filled = 0;
    let total = 6;
    if (watchAll.stationId) filled++;
    if (watchAll.contactPerson) filled++;
    if (watchAll.phone) filled++;
    if (watchAll.parameters && watchAll.parameters.length > 0) filled++;
    if (watchAll.waterSamples && watchAll.waterSamples.length > 0) filled++;
    if (watchAll.notes) filled++;

    setPercentage(Math.round((filled / total) * 100));
  }, [watchAll]);

  const handleStationChange = (id: string) => {
    const selected = stations?.find((s) => s.id === id);
    if (selected) {
      form.setValue("stationId", selected.id);
      form.setValue("stationName", selected.name);
      form.setValue("address", selected.address);
      form.setValue("latitude", selected.latitude);
      form.setValue("longitude", selected.longitude);
    }
  };

  const onSubmit = async (values: CalibrationFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, data: { ...values, status: "Submitted" } });
      toast.success("Calibration successfully submitted!");
      router.push("/calibration");
    } catch {
      toast.error("Failed to submit calibration sheet");
    }
  };

  const saveDraft = async () => {
    const values = form.getValues();
    try {
      await updateMutation.mutateAsync({ id, data: { ...values, status: "Draft" } });
      toast.success("Draft saved successfully!");
    } catch {
      toast.error("Failed to save draft");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading calibration detail...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CalibrationHeader
          reportNo={detail?.reportNo || "Draft"}
          officer={watchAll.officer}
          calibrationDate={watchAll.calibrationDate?.toLocaleDateString() || ""}
          status="Draft"
          completionPercentage={percentage}
        />

        {/* Station Metadatas */}
        <Card>
          <CardContent className="p-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Station</Label>
              <Select onValueChange={handleStationChange} value={watchAll.stationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose station..." />
                </SelectTrigger>
                <SelectContent>
                  {stations?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input placeholder="Enter PIC name" {...form.register("contactPerson")} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="Enter PIC phone" {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input disabled {...form.register("address")} className="bg-slate-50" />
            </div>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
          1. Sensor Parameter Calibration & Register Adjustment
        </h2>
        <ParameterTable form={form} />

        {/* Section 2 */}
        <WaterSampleTable form={form} />

        {/* Notes */}
        <NotesEditor value={watchAll.notes || ""} onChange={(val) => form.setValue("notes", val)} />

        {/* Action Panel */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={saveDraft}>
            Save Draft
          </Button>
          <Button type="submit">Submit Calibration</Button>
        </div>
      </form>
    </div>
  );
}
