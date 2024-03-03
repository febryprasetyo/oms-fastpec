"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  callBackUrl?: string;
};

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type formFields = z.infer<typeof formSchema>;

export default function LoginForm({ callBackUrl = "/" }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<formFields> = async (data) => {
    // Login menggunakan next-auth
    const login = await signIn("credentials", {
      username: data.username,
      password: data.password,
      callbackUrl: callBackUrl,
      redirect: false,
    });

    // Jika login berhasil, maka redirect ke callbackUrl dan tampilkan toast
    if (login?.ok) {
      router.push(callBackUrl);
      toast({
        title: "Login Berhasil",
        description: "Selamat datang, Anda telah berhasil Login",
      });
    } else {
      // Jika login gagal, maka tampilkan toast
      form.resetField("username");
      form.resetField("password");
      toast({
        title: "Login Gagal",
        description: "Username atau password salah!",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-lg space-y-5"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="Username"
                  {...field}
                  disabled={form.formState.isSubmitting}
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
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="password"
                  type="password"
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full bg-primary hover:bg-blue-800 disabled:opacity-50"
        >
          {form.formState.isSubmitting ? "Loading..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
