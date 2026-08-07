import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calibrationService } from "@/services/api/calibration";
import { useAuthStore } from "@/services/store";

export const useCalibrationAuth = () => {
  const user = useAuthStore((state) => state?.user);
  const token = user?.token?.access_token || "";
  const officerName = user?.name || user?.username || "Officer";
  const role = user?.role || "USER";
  return { token, officerName, role };
};

export const useStations = () => {
  const { token } = useCalibrationAuth();
  return useQuery({
    queryKey: ["stations"],
    queryFn: () => calibrationService.getStations(token),
    enabled: !!token,
  });
};

export const useParameters = () => {
  const { token } = useCalibrationAuth();
  return useQuery({
    queryKey: ["master-parameters"],
    queryFn: () => calibrationService.getMasterParameters(token),
    enabled: !!token,
  });
};

export const useCalibrations = () => {
  const { token } = useCalibrationAuth();
  return useQuery({
    queryKey: ["calibrations"],
    queryFn: () => calibrationService.getCalibrations(token),
    enabled: !!token,
  });
};

export const useCalibrationDetail = (id: string) => {
  const { token } = useCalibrationAuth();
  return useQuery({
    queryKey: ["calibration", id],
    queryFn: () => calibrationService.getCalibrationById(id, token),
    enabled: !!id && !!token,
  });
};

export const useCalibrationVerify = (uuid: string) => {
  return useQuery({
    queryKey: ["calibration-verify", uuid],
    queryFn: () => calibrationService.getCalibrationByUuid(uuid),
    enabled: !!uuid,
  });
};

export const useCreateCalibration = () => {
  const queryClient = useQueryClient();
  const { token } = useCalibrationAuth();
  return useMutation({
    mutationFn: (data: any) => calibrationService.createCalibration(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calibrations"] });
    },
  });
};

export const useUpdateCalibration = () => {
  const queryClient = useQueryClient();
  const { token } = useCalibrationAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      calibrationService.updateCalibration(id, data, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["calibrations"] });
      queryClient.invalidateQueries({ queryKey: ["calibration", variables.id] });
    },
  });
};

export const useDeleteCalibration = () => {
  const queryClient = useQueryClient();
  const { token } = useCalibrationAuth();
  return useMutation({
    mutationFn: (id: string) => calibrationService.deleteCalibration(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calibrations"] });
    },
  });
};

export const useApproveCalibration = () => {
  const queryClient = useQueryClient();
  const { token } = useCalibrationAuth();
  return useMutation({
    mutationFn: (id: string) => calibrationService.approveCalibration(id, token),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["calibrations"] });
      queryClient.invalidateQueries({ queryKey: ["calibration", id] });
    },
  });
};
