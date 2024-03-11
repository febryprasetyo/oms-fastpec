"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

type Props = {};

export default function UnAuthorizedModal({}: Props) {
  const pathname = usePathname();

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session berakhir</AlertDialogTitle>
          <AlertDialogDescription>
            Anda tidak memiliki akses ke halaman ini. Silahkan login kembali
            untuk melanjutkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              signOut({
                callbackUrl: pathname,
              });
            }}
          >
            Login
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
