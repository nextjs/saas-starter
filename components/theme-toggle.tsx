/**
 * 主题切换组件
 * 提供一个下拉菜单，允许用户在亮色、暗色和系统主题之间切换
 * 按钮图标会根据当前主题动态变化
 */
"use client"

import * as React from "react"
import { Moon, Sun, Computer } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * 主题切换组件
 * 使用next-themes的useTheme钩子来获取和设置当前主题
 */
export function ThemeToggle() {
  // 获取当前主题和设置主题的函数
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      {/* 下拉菜单触发按钮 */}
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {/* 太阳图标 - 在亮色主题显示，暗色主题隐藏 */}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {/* 月亮图标 - 在暗色主题显示，亮色主题隐藏 */}
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {/* 屏幕阅读器文本 */}
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>

      {/* 下拉菜单内容 */}
      <DropdownMenuContent align="end">
        {/* 亮色主题选项 */}
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        {/* 暗色主题选项 */}
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        {/* 系统主题选项 */}
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Computer className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
