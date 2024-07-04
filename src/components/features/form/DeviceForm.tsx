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
import { addDeviceList, editDeviceList } from "@/services/api/device";
import { useAuthStore } from "@/services/store";

const formSchema = z.object({
  id_mesin: z.string({ required_error: "ID Mesin harus diisi" }),
  dinas_id: z.string({ required_error: "Dinas ID harus diisi" }),
  nama_stasiun: z.string({ required_error: "Nama Stasiun harus diisi" }),
});

type Props = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  action: "add" | "edit";
  value?: DeviceTableData;
};
export default function DeviceForm({ setIsOpen, value, action }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_mesin: value?.id_mesin,
      dinas_id: value?.dinas_id?.toString(),
      nama_stasiun: value?.nama_stasiun,
    },
  });

  const accessToken = useAuthStore((state) => state?.user?.token?.access_token);
  const queryClient = useQueryClient();

  const DeviceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (action == "edit") {
        const res = await editDeviceList(
          value?.id || "",
          data,
          accessToken as string,
        );
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
      queryClient.invalidateQueries({
        queryKey: ["device"],
      });
    },
  });

  const onsubmit = (data: z.infer<typeof formSchema>) => {
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
