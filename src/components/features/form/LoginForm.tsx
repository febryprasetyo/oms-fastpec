"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useState } from "react";

type Props = {
  callBackUrl?: string;
  error?: string;
};

export default function LoginForm({ callBackUrl = "/", error }: Props) {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    signIn("credentials", {
      username: userName,
      password: password,
      redirect: true,
      callbackUrl: callBackUrl,
    });
    setLoading(false);
  };

  return (
    <form
      className="mt-5 space-y-6 w-full sm:max-w-lg mx-auto"
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
