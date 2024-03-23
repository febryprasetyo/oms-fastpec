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
import DeviceForm from "../form/DeviceForm";
import StationForm from "../form/StationForm";

type props = {
  action: "edit" | "add";
  type: "user" | "device" | "station";
  data?: TableData;
};

export default function ActionModal({ action, data, type }: props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {action === "edit" ? (
          <Button size="icon" aria-label="Edit Button">
            <Pen size={20} />
          </Button>
        ) : (
          <Button
            className="bg-primary hover:bg-hover"
            aria-label="Add Data Button"
          >
            Tambah Data
          </Button>
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
        {type === "user" ? (
          <UserForm
            action={action}
            setIsOpen={setIsOpen}
            value={data as UserTableData}
          />
        ) : type === "device" ? (
          <DeviceForm
            action={action}
            setIsOpen={setIsOpen}
            value={data as DeviceTableData}
          />
        ) : type === "station" ? (
          <StationForm
            action={action}
            setIsOpen={setIsOpen}
            value={data as StationTableData}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
