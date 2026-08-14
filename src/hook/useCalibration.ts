import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calibrationService } from "@/services/api/calibration";
import { useAuthStore } from "@/services/store";

export const useCalibrationAuth = () => {
  const user = useAuthStore((state) => state?.user);
  const userData = user?.user_data as { fullname?: string; username?: string; role_id?: string; role_name?: string } | undefined;
  const token = user?.token?.access_token || "";
  const officerName = userData?.fullname || userData?.username || "Petugas";
  const role = userData?.role_id || userData?.role_name || "usr";
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

export const useCalibrations = (options: { limit: number; offset: number; status?: "draft" | "submitted" | "approved" }) => {
  const { token } = useCalibrationAuth();
  return useQuery({
    queryKey: ["calibrations", options],
    queryFn: () => calibrationService.getCalibrations(token, options),
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

export const useSubmitCalibration = () => {
  const queryClient = useQueryClient();
  const { token } = useCalibrationAuth();

  return useMutation({
    mutationFn: (id: string) => calibrationService.submitCalibration(id, token),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["calibrations"] });
      queryClient.invalidateQueries({ queryKey: ["calibration", id] });
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
