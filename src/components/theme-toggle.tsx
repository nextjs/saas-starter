import { Moon } from "lucide-react";

import { Sun } from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import { cn } from "../lib/utils";

export function ThemeToggle({ className, children }: { className?: string, children?: React.ReactNode  }) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 cursor-pointer",
        className
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      {children}
    </button>
  );
}
