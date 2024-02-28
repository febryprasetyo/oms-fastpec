"use client";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";
import { useTheme } from "next-themes";
type Props = {};

export default function ThemeToogle({}: Props) {
  const { setTheme, theme } = useTheme();

  const handleClick = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      aria-label="Toggle Theme"
      size="icon"
      className="bg-primary text-white aspect-square w-8 h-8"
      onClick={handleClick}
    >
      <Moon size={20} />
    </Button>
  );
}
