import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useState } from "react";
import { Pen, X } from "lucide-react";
import UserForm from "../form/UserForm";

type props = {
  action: "edit" | "add";
  id?: string;
  default_username?: string;
  default_nama_dinas?: string;
  default_api_key?: string;
  default_secret_key?: string;
};

export default function UserModal({
  action,
  id,
  default_username,
  default_nama_dinas,
  default_api_key,
  default_secret_key,
}: props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {action === "edit" ? (
          <Button size="icon">
            <Pen size={20} />
          </Button>
        ) : (
          <Button className="bg-primary hover:bg-hover">Tambah Data</Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[625px]">
        <DialogHeader>
          <div className="absolute right-3 top-3">
            <Button
              size="icon"
              variant="destructive"
              className="size-6"
              onClick={() => setIsOpen(false)}
            >
              <X />
            </Button>
          </div>
          <DialogTitle>
            {action === "edit" ? "Edit Data Stasiun" : "Tambah Data Stasiun"}
          </DialogTitle>
          <DialogDescription>
            {action === "edit" ? "Edit Data Stasiun" : "Tambah Data Stasiun"}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          setIsOpen={setIsOpen}
          action={action}
          id={id}
          default_username={default_username}
          default_nama_dinas={default_nama_dinas}
          default_api_key={default_api_key}
          default_secret_key={default_secret_key}
        />
      </DialogContent>
    </Dialog>
  );
}
