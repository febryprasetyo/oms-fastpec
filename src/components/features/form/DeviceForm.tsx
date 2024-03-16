"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { addDeviceList, editDeviceList } from "@/services/api/device";

const formSchema = z.object({
  id_mesin: z.string({ required_error: "ID Mesin harus diisi" }),
  dinas_id: z.string({ required_error: "Dinas ID harus diisi" }),
  nama_stasiun: z.string({ required_error: "Nama Stasiun harus diisi" }),
});

type Props = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  action: "add" | "edit";
  id?: string;
  default_id_mesin?: string;
  default_dinas_id?: string | number;
  default_nama_stasiun?: string;
};
export default function DeviceForm({
  setIsOpen,
  default_dinas_id,
  default_id_mesin,
  default_nama_stasiun,
  action,
  id,
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_mesin: default_id_mesin || undefined,
      dinas_id: default_dinas_id?.toString() || undefined,
      nama_stasiun: default_nama_stasiun || undefined,
    },
  });

  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const queryClient = useQueryClient();

  const DeviceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (action == "edit") {
        const res = await editDeviceList(id, data, accessToken as string);
        return res;
      } else if (action == "add") {
        const res = await addDeviceList(data, accessToken as string);
        return res;
      }
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
        title: "Berhasil",
        description:
          action === "edit" ? "Data berhasil diubah" : "Data berhasil ditambah",
        variant: "default",
      });
      form.reset();
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["mesin"],
      });
    },
  });

  const onsubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data.dinas_id);
    DeviceMutation.mutate(data);
    setIsOpen(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onsubmit)}
        className="flex flex-col items-end justify-center space-y-5"
      >
        <div className="w-full space-y-3">
          <FormField
            control={form.control}
            name="nama_stasiun"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nama Stasiun</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Stasiun" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="id_mesin"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>ID Mesin</FormLabel>
                <FormControl>
                  <Input placeholder="ID Mesin" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dinas_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Dinas ID</FormLabel>
                <FormControl>
                  <Input placeholder="Dinas ID" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Tambah Data
        </Button>
      </form>
    </Form>
  );
}
