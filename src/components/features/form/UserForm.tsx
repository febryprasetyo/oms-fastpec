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
import { addUserList, editUserList } from "@/services/api/user";

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

type props = {
  setIsOpen: Function;
  action: "edit" | "add";
  value?: UserTableData;
};

export default function UserForm({ setIsOpen, action, value }: props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: value?.username,
      nama_dinas: value?.nama_dinas,
      api_key: value?.api_key,
      secret_key: value?.secret_key,
    },
  });

  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const queryClient = useQueryClient();

  const addStationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (action === "edit") {
        return await editUserList(
          { id: value?.id || "", ...data },
          accessToken as string,
        );
      } else if (action === "add") {
        return await addUserList(data, accessToken as string);
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
          action === "edit"
            ? "Data berhasil diubah"
            : "Data berhasil ditambahkan",
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
                  <Input {...field} />
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
                  <Input type="password" {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          {action == "add" ? "Tambah Data" : "Edit Data"}
        </Button>
      </form>
    </Form>
  );
}
