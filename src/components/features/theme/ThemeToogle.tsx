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
  //  button untuk toggle theme
  return (
    <Button
      aria-label="Toggle Theme"
      size="icon"
      className="aspect-square h-8 w-8 bg-primary text-white dark:text-white"
      onClick={handleClick}
    >
      <Moon size={20} />
    </Button>
  );
}
