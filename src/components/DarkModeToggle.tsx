"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dark-mode") === "true";
    setDark(stored);
    document.documentElement.setAttribute("data-dark", stored ? "true" : "false");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("dark-mode", String(next));
    document.documentElement.setAttribute("data-dark", next ? "true" : "false");
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      title={dark ? "Açık moda geç" : "Koyu moda geç"}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
