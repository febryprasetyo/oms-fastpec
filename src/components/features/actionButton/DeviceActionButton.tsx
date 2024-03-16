import { Button } from "@/components/ui/button";
import { Pen, Trash } from "lucide-react";
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
import { useSession } from "next-auth/react";
import { DeleteDeviceList } from "@/services/api/device";
import DeviceModal from "../modal/DeviceModal";

type Props = {
  id: string;
  default_id_mesin?: string;
  default_dinas_id?: string;
  default_nama_stasiun?: string;
};

export default function DeviceActionButton({
  id,
  default_dinas_id,
  default_id_mesin,
  default_nama_stasiun,
}: Props) {
  const queryClient = useQueryClient();
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return DeleteDeviceList(id, accessToken as string);
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
        queryKey: ["mesin"],
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="flex gap-3">
      <DeviceModal
        action="edit"
        id={id}
        default_dinas_id={default_dinas_id}
        default_id_mesin={default_id_mesin}
        default_nama_stasiun={default_nama_stasiun}
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="destructive">
            <Trash size={20} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="">
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
