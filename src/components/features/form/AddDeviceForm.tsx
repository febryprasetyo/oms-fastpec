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
import { addDeviceList } from "@/services/api/device";

const formSchema = z.object({
  id_mesin: z.string({ required_error: "ID Mesin harus diisi" }),
  dinas_id: z.string({ required_error: "Dinas ID harus diisi" }),
  nama_stasiun: z.string({ required_error: "Nama Stasiun harus diisi" }),
});

export default function AddDeviceForm({ setIsOpen }: { setIsOpen: Function }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const queryClient = useQueryClient();

  const addStationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await addDeviceList(data, accessToken as string);
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
        description: "Data berhasil ditambahkan",
        variant: "default",
      });
      form.reset();
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["device"],
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    addStationMutation.mutate(values);
    setIsOpen(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
