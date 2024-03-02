"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  callBackUrl?: string;
  error?: string;
};

export default function LoginForm({ callBackUrl = "/" }: Props) {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Login menggunakan next-auth
    const login = await signIn("credentials", {
      username: userName,
      password: password,
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
      toast({
        title: "Login Gagal",
        description: "Username atau password salah!",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <form
      className="mx-auto mt-5 w-full space-y-6 sm:max-w-lg"
      onSubmit={handleSubmit}
    >
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="username">Username :</Label>
        <Input
          type="text"
          id="username"
          placeholder="Username"
          onChange={handleUserNameChange}
          required
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password">Password :</Label>
        <Input
          type="password"
          id="password"
          placeholder="Password"
          onChange={handlePasswordChange}
          required
        />
      </div>
      <Button
        className="w-full bg-primary hover:bg-hover disabled:bg-primary/50"
        type="submit"
        aria-label="Login Button"
        disabled={loading}
      >
        Login
      </Button>
    </form>
  );
}
