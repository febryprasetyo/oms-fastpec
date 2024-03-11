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
import { useState } from "react";

export default function AddStationModal() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    // @ts-ignore
    <Dialog open={isOpen} setIsOpen={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
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
