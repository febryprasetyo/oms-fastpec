"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalibrationSchema, CalibrationFormValues } from "@/schemas/calibration.schema";
import { useStations, useParameters, useCreateCalibration, useCalibrationAuth } from "@/hook/useCalibration";
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

export default function CreateCalibration() {
  const router = useRouter();
  const { officerName } = useCalibrationAuth();
  const { data: stations } = useStations();
  const { data: params } = useParameters();
  const createMutation = useCreateCalibration();
  const [percentage, setPercentage] = useState(0);

  const form = useForm<CalibrationFormValues>({
    resolver: zodResolver(CalibrationSchema),
    defaultValues: {
      stationId: "",
      stationName: "",
      address: "",
      latitude: 0,
      longitude: 0,
      calibrationDate: new Date(),
      contactPerson: "",
      phone: "",
      officer: officerName,
      parameters: [],
      waterSamples: [
        {
          sampleName: "Aquades (Blank)",
          temperature: undefined,
          ph: undefined,
          doValue: undefined,
          conductivity: undefined,
          tds: undefined,
          salinity: undefined,
          turbidity: undefined,
          cod: undefined,
          bod: undefined,
          tss: undefined,
          nh3: undefined,
          no3: undefined,
          orp: undefined,
        },
      ],
      notes: "",
    },
  });

  const watchAll = form.watch();

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

  // Set default parameters
  useEffect(() => {
    if (params && params.length > 0 && form.getValues("parameters").length === 0) {
      const formatted = params.map((p) => {
        const isPh = p.name.toLowerCase() === "ph";
        return {
          parameterId: p.id,
          parameterName: p.name,
          spec: p.spec,
          results: isPh
            ? [
                { standardName: "Buffer pH 4.00", value: "" },
                { standardName: "Buffer pH 7.01", value: "" },
                { standardName: "Buffer pH 10.01", value: "" },
              ]
            : [
                { standardName: "CRM Level 1", value: "" },
                { standardName: "CRM Level 2", value: "" },
              ],
          coefficients: isPh
            ? [
                { key: "K1", value: 0 },
                { key: "K2", value: 0 },
                { key: "K3", value: 0 },
                { key: "K4", value: 0 },
              ]
            : [
                { key: "K", value: 0 },
                { key: "B", value: 0 },
              ],
          status: "PASS" as const,
        };
      });
      form.setValue("parameters", formatted);
    }
  }, [params]);

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
      await createMutation.mutateAsync({ ...values, status: "Submitted" });
      toast.success("Calibration successfully submitted!");
      router.push("/calibration");
    } catch {
      toast.error("Failed to submit calibration sheet");
    }
  };

  const saveDraft = async () => {
    const values = form.getValues();
    try {
      await createMutation.mutateAsync({ ...values, status: "Draft" });
      toast.success("Draft saved successfully!");
    } catch {
      toast.error("Failed to save draft");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CalibrationHeader
          reportNo="Draft"
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
