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
import { addUserList } from "@/services/api/user";

const formSchema = z.object({
  username: z.string({
    required_error: "Username harus diisi",
  }),
  password: z.string({
    required_error: "Password harus diisi",
  }),
  nama_dinas: z.string({
    required_error: "Nama Dinas harus diisi",
  }),
  api_key: z.string({
    required_error: "API Key harus diisi",
  }),
  secret_key: z.string({
    required_error: "Secret Key harus diisi",
  }),
});

export default function AddUserForm({ setIsOpen }: { setIsOpen: Function }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const queryClient = useQueryClient();

  const addStationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await addUserList(data, accessToken as string);
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
        queryKey: ["user"],
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
            name="username"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nama_dinas"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nama Dinas</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Dinas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="api_key"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input placeholder="API Key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secret_key"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Secret Key</FormLabel>
                <FormControl>
                  <Input placeholder="Secret Key" {...field} />
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
