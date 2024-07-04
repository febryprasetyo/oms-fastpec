import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { DeleteStationList } from "@/services/api/station";
import { DeleteUserList } from "@/services/api/user";
import { DeleteDeviceList } from "@/services/api/device";
import ActionModal from "./ActionModal";
import { useAuthStore } from "@/services/store";

type props = {
  action: "edit" | "add";
  type: "user" | "device" | "station";
  data: TableData;
};

export default function ActionButton({ action, data, type }: props) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state?.user?.token?.access_token);
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number): Promise<void> => {
      if (type === "user") {
        return DeleteUserList(id, accessToken as string);
      }
      if (type === "station") {
        return DeleteStationList(id, accessToken as string);
      }
      if (type === "device") {
        return DeleteDeviceList(id, accessToken as string);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Data berhasil dihapus",
      });
      queryClient.invalidateQueries({
        queryKey: [type],
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(data.id);
  };

  return (
    <div className="flex gap-3">
      <ActionModal action={action} data={data} type={type} />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="destructive" aria-label="Delete Button">
            <Trash size={20} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apakah anda yakin ingin menghapus data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Data yang sudah dihapus tidak dapat dikembalikan lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger hover:bg-red-800"
              onClick={handleDelete}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
