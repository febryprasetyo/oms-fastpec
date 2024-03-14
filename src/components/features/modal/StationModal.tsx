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
import StationForm from "../form/StationForm";

type props = {
  action: "add" | "edit";
  id?: string;
  default_nama_stasiun?: string;
  default_address?: string;
  default_nama_dinas?: string;
  default_device_id?: string;
  default_province_id?: string;
  default_city_id?: string;
};
export default function StationModal({
  action,
  id,
  default_nama_stasiun,
  default_address,
  default_nama_dinas,
  default_device_id,
  default_province_id,
  default_city_id,
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
        <StationForm
          setIsOpen={setIsOpen as React.Dispatch<React.SetStateAction<boolean>>}
          action={action}
          id={id}
          default_nama_stasiun={default_nama_stasiun}
          default_address={default_address}
          default_nama_dinas={default_nama_dinas}
          default_device_id={default_device_id}
          default_province_id={default_province_id}
          default_city_id={default_city_id}
        />
      </DialogContent>
    </Dialog>
  );
}
