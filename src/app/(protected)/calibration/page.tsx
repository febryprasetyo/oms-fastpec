"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCalibrations, useDeleteCalibration, useApproveCalibration, useCalibrationAuth } from "@/hook/useCalibration";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/features/badge/StatusBadge";
import { Plus, Search, Eye, Edit, Trash2, CheckCircle } from "lucide-react";
import { CalibrationListSkeleton } from "@/components/features/calibration/CalibrationSkeleton";
import { toast } from "sonner";

export default function CalibrationDashboard() {
  const { data: calibrations, isLoading } = useCalibrations();
  const deleteMutation = useDeleteCalibration();
  const approveMutation = useApproveCalibration();
  const { role } = useCalibrationAuth();
  const [search, setSearch] = useState("");

  const filtered = (calibrations || []).filter(
    (c) =>
      c.stationName.toLowerCase().includes(search.toLowerCase()) ||
      c.reportNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this calibration sheet?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Calibration deleted successfully");
      } catch {
        toast.error("Failed to delete calibration");
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Calibration approved successfully");
    } catch {
      toast.error("Failed to approve calibration");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calibration Logs</h1>
          <p className="text-sm text-slate-500">Manage, review and verify station sensor calibrations.</p>
        </div>
        <Link href="/calibration/create">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>New Calibration</span>
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search station or report number..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-bold text-slate-700">Report No</TableHead>
              <TableHead className="font-bold text-slate-700">Station</TableHead>
              <TableHead className="font-bold text-slate-700">Date</TableHead>
              <TableHead className="font-bold text-slate-700">Officer</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">Status</TableHead>
              <TableHead className="w-[180px] font-bold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4">
                  <CalibrationListSkeleton />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No calibration logs found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-slate-800">{c.reportNo}</TableCell>
                  <TableCell>{c.stationName}</TableCell>
                  <TableCell>{c.calibrationDate}</TableCell>
                  <TableCell>{c.officer}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/calibration/${c.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      {c.status === "Draft" && (
                        <Link href={`/calibration/edit/${c.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}

                      {role === "ADMIN" && c.status === "Submitted" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-800"
                          onClick={() => handleApprove(c.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {c.status === "Draft" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
