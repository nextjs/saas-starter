// Disalin dari skill app-builder (assets/ui/searchable-select.tsx).
// Import Popover disesuaikan ke paket `radix-ui` terpadu yang dipakai repo ini.
//
// WAJIB dipakai untuk SEMUA dropdown di seluruh app, berapa pun jumlah opsinya.
// <select> HTML polos dan Radix Select telanjang tidak dipakai.

"use client";

import * as React from "react";
import { Popover } from "radix-ui";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  /** Teks kecil di bawah label, mis. SKU atau kategori */
  hint?: string;
  disabled?: boolean;
}

interface BaseProps {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  /** Wajib diisi kalau field ini tidak boleh kosong */
  required?: boolean;
  /** Pesan error di bawah field */
  error?: string;
  /** Pencarian di sisi server — pakai kalau opsi > 200 baris */
  onSearch?: (query: string) => void;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
}

interface MultiProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export function SearchableSelect(props: SingleProps | MultiProps) {
  const {
    options,
    label,
    placeholder = "Pilih...",
    searchPlaceholder = "Cari...",
    emptyText = "Tidak ditemukan",
    disabled,
    className,
    required,
    error,
    onSearch,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selectedSingle =
    !props.multiple && props.value
      ? options.find((o) => o.value === props.value) ?? null
      : null;

  const selectedMulti = props.multiple
    ? options.filter((o) => props.value.includes(o.value))
    : [];

  function handleSelect(value: string) {
    if (props.multiple) {
      const next = props.value.includes(value)
        ? props.value.filter((v) => v !== value)
        : [...props.value, value];
      props.onChange(next);
      // popover tetap terbuka untuk pilihan ganda
    } else {
      props.onChange(value === props.value ? null : value);
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-0.5 text-red-600 dark:text-red-400">*</span>}
        </label>
      )}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={label ?? placeholder}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
              "border-gray-300 bg-white text-gray-900",
              "dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-50",
              "hover:bg-gray-50 dark:hover:bg-zinc-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              "dark:focus:ring-blue-400 dark:focus:ring-offset-zinc-900",
              "disabled:cursor-not-allowed disabled:opacity-60",
              error && "border-red-500 dark:border-red-400"
            )}
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {props.multiple ? (
                selectedMulti.length > 0 ? (
                  selectedMulti.map((o) => (
                    <span
                      key={o.value}
                      className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-900 dark:bg-blue-900/50 dark:text-blue-100"
                    >
                      {o.label}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onChange(props.value.filter((v) => v !== o.value));
                        }}
                      />
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
                )
              ) : selectedSingle ? (
                <span className="truncate">{selectedSingle.label}</span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className={cn(
              "z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border shadow-lg",
              "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
            )}
          >
            <Command shouldFilter={!onSearch} className="w-full">
              <div className="border-b border-gray-200 px-3 dark:border-zinc-700">
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={(v) => {
                    setQuery(v);
                    onSearch?.(v);
                  }}
                  placeholder={searchPlaceholder}
                  className={cn(
                    "w-full bg-transparent py-2.5 text-sm outline-none",
                    "text-gray-900 placeholder:text-gray-500",
                    "dark:text-gray-50 dark:placeholder:text-gray-400"
                  )}
                />
              </div>

              <Command.List className="max-h-64 overflow-y-auto p-1">
                <Command.Empty className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  {emptyText}
                </Command.Empty>

                {options.map((o) => {
                  const isSelected = props.multiple
                    ? props.value.includes(o.value)
                    : props.value === o.value;

                  return (
                    <Command.Item
                      key={o.value}
                      value={`${o.label} ${o.hint ?? ""} ${o.value}`}
                      disabled={o.disabled}
                      onSelect={() => handleSelect(o.value)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm",
                        "text-gray-900 dark:text-gray-50",
                        "data-[selected=true]:bg-gray-100 dark:data-[selected=true]:bg-zinc-700",
                        "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{o.label}</span>
                        {o.hint && (
                          <span className="block truncate text-xs text-gray-600 dark:text-gray-400">
                            {o.hint}
                          </span>
                        )}
                      </span>
                    </Command.Item>
                  );
                })}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
