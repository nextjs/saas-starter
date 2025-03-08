import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Conditionally joins classNames together, and merges them with Tailwind CSS class utilities intelligently.
 * 
 * This function uses clsx for conditional class merging and tailwind-merge to handle Tailwind CSS conflicts.
 * It properly handles arbitrary values, complex variants, and ensures the last conflicting class wins.
 * 
 * @param inputs - One or more class values to merge (strings, objects, or arrays of strings/objects).
 * @returns A single string of merged class names, with Tailwind CSS conflicts resolved.
 * 
 * @example
 * // Basic class merging
 * cn("px-2", "py-1") // -> "px-2 py-1"
 * 
 * @example
 * // Conditional classes using object notation
 * cn("px-2", { "text-red-500": isError, "bg-blue-500": isActive }) 
 * // -> "px-2 text-red-500 bg-blue-500" (if both conditions are true)
 * 
 * @example
 * // Conflict resolution (last one wins)
 * cn("bg-red-500", "bg-blue-500") // -> "bg-blue-500"
 * cn("text-sm", "text-lg") // -> "text-lg"
 * 
 * @example
 * // Arbitrary values
 * cn("w-[72px]", "h-[50px]") // -> "w-[72px] h-[50px]"
 * cn("w-[72px]", "w-full") // -> "w-full" (conflict resolution)
 * 
 * @example
 * // Complex variants
 * cn("dark:hover:bg-gray-800", "dark:hover:bg-gray-700") // -> "dark:hover:bg-gray-700"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
