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
import { DeleteUserList } from "@/services/api/user";
import UserModal from "../modal/UserModal";

type Props = {
  id: string;
  default_username: string;
  default_nama_dinas: string;
  default_api_key: string;
  default_secret_key: string;
};

export default function UserActionButton({
  id,
  default_username,
  default_nama_dinas,
  default_api_key,
  default_secret_key,
}: Props) {
  const queryClient = useQueryClient();
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return DeleteUserList(id, accessToken as string);
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
        queryKey: ["user"],
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="flex gap-3">
      <UserModal
        action="edit"
        id={id}
        default_username={default_username}
        default_nama_dinas={default_nama_dinas}
        default_api_key={default_api_key}
        default_secret_key={default_secret_key}
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
