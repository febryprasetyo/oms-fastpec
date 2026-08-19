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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUserList, editUserList } from "@/services/api/user";
import { useAuthStore } from "@/services/store";
import { Shield, UserCheck, Building2 } from "lucide-react";

const formSchema = z
  .object({
    role_id: z.enum(["usr", "eng", "adm"]),
    username: z.string().min(1, { message: "Username harus diisi" }),
    password: z.string().min(1, { message: "Password harus diisi" }),
    nama_dinas: z.string().min(1, { message: "Nama / Nama Dinas harus diisi" }),
    api_key: z.string().optional(),
    secret_key: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role_id === "usr") {
      if (!data.api_key || data.api_key.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["api_key"],
          message: "API Key harus diisi untuk User Dinas",
        });
      }
      if (!data.secret_key || data.secret_key.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["secret_key"],
          message: "Secret Key harus diisi untuk User Dinas",
        });
      }
    }
  });

type props = {
  setIsOpen: Function;
  action: "edit" | "add";
  value?: UserTableData;
  defaultRole?: "usr" | "eng" | "adm";
};

export default function UserForm({ setIsOpen, action, value, defaultRole = "usr" }: props) {
  // Determine initial role
  const initialRole: "usr" | "eng" | "adm" =
    value?.role_id === "eng"
      ? "eng"
      : value?.role_id === "adm"
      ? "adm"
      : value?.role_id === "usr"
      ? "usr"
      : defaultRole;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role_id: initialRole,
      username: value?.username || "",
      password: "",
      nama_dinas: value?.nama_dinas || "",
      api_key: value?.api_key || "",
      secret_key: value?.secret_key || "",
    },
  });

  const currentRole = form.watch("role_id");
  const accessToken = useAuthStore((state) => state?.user?.token?.access_token);
  const queryClient = useQueryClient();

  const userMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = {
        role_id: data.role_id,
        username: data.username.trim(),
        password: data.password.trim(),
        nama_dinas: data.nama_dinas.trim(),
        api_key: data.role_id === "usr" ? (data.api_key?.trim() || "") : "",
        secret_key: data.role_id === "usr" ? (data.secret_key?.trim() || "") : "",
      };

      if (action === "edit") {
        return await editUserList(
          { id: value?.id || "", ...payload },
          accessToken as string,
        );
      } else if (action === "add") {
        return await addUserList(payload, accessToken as string);
      }
    },

    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memproses data user",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      toast({
        title: "Berhasil",
        description:
          action === "edit"
            ? "Data user berhasil diubah"
            : "Akun user berhasil ditambahkan",
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
    userMutation.mutate(values);
    setIsOpen(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-end justify-center space-y-5"
      >
        <div className="w-full space-y-4">
          {/* Role Selection */}
          <FormField
            control={form.control}
            name="role_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm font-semibold">Tipe Akun / Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Pilih Role Pengguna" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="usr">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span>User Dinas / Client</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="eng">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                        <span>Engineering</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="adm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-500" />
                        <span>Administrator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm font-semibold">Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-11 rounded-xl"
                    placeholder="Masukan Username..."
                  />
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
                <FormLabel className="text-sm font-semibold">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    className="h-11 rounded-xl"
                    placeholder="Masukan Password..."
                  />
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
                <FormLabel className="text-sm font-semibold">
                  {currentRole === "usr" ? "Nama Dinas" : "Nama Lengkap"}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-11 rounded-xl"
                    placeholder={
                      currentRole === "usr"
                        ? "Masukan Nama Dinas..."
                        : "Masukan Nama Lengkap..."
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* API Key & Secret Key only for User Dinas */}
          {currentRole === "usr" && (
            <>
              <FormField
                control={form.control}
                name="api_key"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm font-semibold">API Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 rounded-xl"
                        placeholder="Masukan API Key..."
                      />
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
                    <FormLabel className="text-sm font-semibold">Secret Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 rounded-xl"
                        placeholder="Masukan Secret Key..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4 w-full justify-end">
          <Button
            type="button"
            className="w-36 h-11 rounded-xl"
            variant="destructive"
            onClick={() => setIsOpen(false)}
          >
            Batal
          </Button>

          <Button
            type="submit"
            className="w-36 h-11 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 font-bold"
          >
            {action === "add" ? "Tambah Data" : "Edit Data"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
