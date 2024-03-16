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
import DeviceForm from "../form/DeviceForm";

type props = {
  action: "add" | "edit";
  id?: string;
  default_id_mesin?: string;
  default_dinas_id?: string | number;
  default_nama_stasiun?: string;
};
export default function DeviceModal({
  action,
  id,
  default_dinas_id,
  default_id_mesin,
  default_nama_stasiun,
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
            {action === "edit" ? "Edit Data Device" : "Tambah Data Device"}
          </DialogTitle>
          <DialogDescription>
            {action === "edit" ? "Edit Data Device" : "Tambah Data Device"}
          </DialogDescription>
        </DialogHeader>
        <DeviceForm
          setIsOpen={setIsOpen as React.Dispatch<React.SetStateAction<boolean>>}
          action={action}
          id={id}
          default_dinas_id={default_dinas_id}
          default_id_mesin={default_id_mesin}
          default_nama_stasiun={default_nama_stasiun}
        />
      </DialogContent>
    </Dialog>
  );
}
