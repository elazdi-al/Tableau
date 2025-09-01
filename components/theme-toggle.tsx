"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 w-6 h-6 rounded-full transition-none"
      style={{
        backgroundColor: theme === "dark" ? "#ffffff" : "#2f2f2f",
      }}
      aria-label="Toggle theme"
    />
  );
}