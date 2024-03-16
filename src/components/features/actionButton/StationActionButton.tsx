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
import { useSession } from "next-auth/react";
import { DeleteStationList } from "@/services/api/station";
import StationModal from "../modal/StationModal";

type Props = {
  id: string;
  default_nama_stasiun: string;
  default_address: string;
  default_nama_dinas: string;
  default_device_id: string;
  default_province_id: string;
  default_city_id: string;
};

export default function StationActionButton({
  id,
  default_nama_stasiun,
  default_address,
  default_nama_dinas,
  default_device_id,
  default_province_id,
  default_city_id,
}: Props) {
  const queryClient = useQueryClient();
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return DeleteStationList(id, accessToken as string);
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
        queryKey: ["station"],
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="flex gap-3">
      <StationModal
        action="edit"
        id={id}
        default_nama_stasiun={default_nama_stasiun}
        default_address={default_address}
        default_nama_dinas={default_nama_dinas}
        default_device_id={default_device_id}
        default_province_id={default_province_id}
        default_city_id={default_city_id}
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
