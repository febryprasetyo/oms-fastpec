"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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
import { useAuthStore } from "@/services/store";
import { User, Lock, Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

type formFields = z.infer<typeof formSchema>;

export default function LoginForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<formFields> = async (data) => {
    try {
      await useAuthStore.getState().doLogin(data);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-6"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300">Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      required
                      placeholder="Masukkan username"
                      {...field}
                      disabled={form.formState.isSubmitting}
                      className="pl-10 ring-offset-white focus-visible:ring-primary dark:bg-darkSecondary dark:ring-offset-slate-950"
                    />
                  </div>
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
                <FormLabel className="text-slate-700 dark:text-slate-300">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      required
                      placeholder="Masukkan password"
                      type="password"
                      {...field}
                      disabled={form.formState.isSubmitting}
                      className="pl-10 ring-offset-white focus-visible:ring-primary dark:bg-darkSecondary dark:ring-offset-slate-950"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="relative w-full overflow-hidden bg-primary py-6 text-base font-semibold transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-70"
        >
          {form.formState.isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memproses...</span>
            </div>
          ) : (
            "Masuk ke Dashboard"
          )}
        </Button>
      </form>
    </Form>
  );
}
