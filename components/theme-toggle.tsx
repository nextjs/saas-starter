// Disalin dari skill app-builder (assets/theme/).
"use client";

import * as React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

function apply(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>("system");

  React.useEffect(() => {
    setTheme((localStorage.getItem("theme") as Theme) ?? "system");
  }, []);

  // Ikuti perubahan tema OS selama user masih memilih "system"
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  function pick(next: Theme) {
    setTheme(next);
    apply(next);
  }

  const opsi: { key: Theme; icon: typeof Sun; label: string }[] = [
    { key: "light", icon: Sun, label: "Terang" },
    { key: "dark", icon: Moon, label: "Gelap" },
    { key: "system", icon: Monitor, label: "Ikuti sistem" },
  ];

  return (
    <div
      role="group"
      aria-label="Pilih tema"
      className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
    >
      {opsi.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => pick(key)}
          aria-label={label}
          title={label}
          aria-pressed={theme === key}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            theme === key
              ? "bg-gray-200 text-gray-900 dark:bg-zinc-700 dark:text-gray-50"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-700"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
