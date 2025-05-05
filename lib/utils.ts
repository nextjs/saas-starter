import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并CSS类名工具函数
 *
 * 这个函数结合了clsx和tailwind-merge的功能：
 * 1. 使用clsx合并多个类名参数（处理条件类名、数组等）
 * 2. 使用tailwind-merge解决Tailwind CSS类名冲突问题
 *
 * @param inputs - 要合并的CSS类名（字符串、对象、数组等）
 * @returns 合并后的CSS类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
