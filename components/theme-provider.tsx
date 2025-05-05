/**
 * 主题提供者组件
 * 使用next-themes库为应用提供主题支持
 * 允许在亮色、暗色和系统主题之间切换
 */
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

/**
 * 主题提供者组件
 * 包装next-themes的ThemeProvider，为整个应用提供主题上下文
 *
 * @param children - 子组件
 * @param props - 传递给next-themes ThemeProvider的其他属性
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
