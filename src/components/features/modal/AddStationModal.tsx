import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import AddStationForm from "../form/AddStationForm";

export default function AddStationModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-hover">Tambah Data</Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Tambah Data</DialogTitle>
          <DialogDescription>Tambah data stasiun baru</DialogDescription>
        </DialogHeader>
        <AddStationForm />
      </DialogContent>
    </Dialog>
  );
}
