import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import { toast } from "sonner";
import { calibrationService } from "@/services/api/calibration";
import { useAuthStore } from "@/services/store";
import type { CalibrationDetail, CalibrationPhotoType } from "@/types/calibration";

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

interface DocumentationMutationVariables {
  calibrationId: string;
  detailId: number;
  parameterId: string;
  photoType: CalibrationPhotoType;
}

export const useUploadCalibrationDocumentation = () => {
  const queryClient = useQueryClient();
  const { token } = useCalibrationAuth();

  return useMutation({
    mutationFn: ({
      calibrationId,
      detailId,
      photoType,
      file,
      onUploadProgress,
    }: DocumentationMutationVariables & {
      file: File;
      onUploadProgress?: (event: AxiosProgressEvent) => void;
    }) => calibrationService.uploadDocumentation({
      calibrationId,
      detailId,
      photoType,
      file,
      accessToken: token,
      onUploadProgress,
    }),
    onSuccess: (documentation, variables) => {
      queryClient.setQueryData<CalibrationDetail>(["calibration", variables.calibrationId], (current) => {
        if (!current) return current;
        return {
          ...current,
          parameters: current.parameters.map((parameter) => parameter.parameterId === variables.parameterId
            ? {
                ...parameter,
                documentation: { ...parameter.documentation, [variables.photoType]: documentation },
              }
            : parameter),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["calibration", variables.calibrationId] });
      toast.success(variables.photoType === "before"
        ? "Foto Before Calibration berhasil disimpan."
        : "Foto After Calibration berhasil disimpan.");
    },
  });
};

export const useDeleteCalibrationDocumentation = () => {
  const queryClient = useQueryClient();
  const { token } = useCalibrationAuth();

  return useMutation({
    mutationFn: (variables: DocumentationMutationVariables) => calibrationService.deleteDocumentation({
      calibrationId: variables.calibrationId,
      detailId: variables.detailId,
      photoType: variables.photoType,
      accessToken: token,
    }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<CalibrationDetail>(["calibration", variables.calibrationId], (current) => {
        if (!current) return current;
        return {
          ...current,
          parameters: current.parameters.map((parameter) => {
            if (parameter.parameterId !== variables.parameterId) return parameter;
            const documentation = { ...parameter.documentation };
            delete documentation[variables.photoType];
            return { ...parameter, documentation };
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["calibration", variables.calibrationId] });
      toast.success("Foto dokumentasi berhasil dihapus.");
    },
  });
};
