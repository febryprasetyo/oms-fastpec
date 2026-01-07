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
import { Pen, X, Plus, Edit2 } from "lucide-react";
import UserForm from "../form/UserForm";
import DeviceForm from "../form/DeviceForm";
import StationForm from "../form/StationForm";
import InventarisForm from "../form/InventarisForm";
import PengajuanInternetForm from "../form/PengajuanInternetForm";
import PengajuanListrikForm from "../form/PengajuanListrikForm";

type props = {
  action: "edit" | "add";
  type: "user" | "device" | "station" | "inventory" | "pengajuan" | "pengajuan-internet" | "pengajuan-listrik";
  data?: TableData;
};

export default function ActionModal({ action, data, type }: props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {action === "edit" ? (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 dark:text-slate-400 dark:hover:text-primary dark:hover:bg-primary/10 transition-all"
            aria-label="Edit Button"
          >
            <Edit2 size={16} />
          </Button>
        ) : (
          <Button
            className="bg-primary h-11 px-6 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2"
            aria-label="Add Data Button"
          >
            <Plus className="h-4 w-4" />
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
          <DialogTitle className="capitalize">
            {action === "edit" ? `Edit Data ${type}` : `Tambah Data ${type}`}
          </DialogTitle>
          <DialogDescription className="capitalize">
            {action === "edit" ? `Edit Data ${type}` : `Tambah Data ${type}`}
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
        ) : type === "inventory" ? (
          <InventarisForm
            action={action}
            setIsOpen={setIsOpen}
            value={data as InventoryTableData}
          />
        ) : type === "pengajuan-internet" ? (
          <PengajuanInternetForm
            action={action}
            setIsOpen={setIsOpen}
            data={data as PengajuanInternetData}
          />
        ) : type === "pengajuan-listrik" ? (
          <PengajuanListrikForm
            action={action}
            setIsOpen={setIsOpen}
            data={data as PengajuanListrikData}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}