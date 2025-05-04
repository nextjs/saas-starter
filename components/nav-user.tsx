"use client"

import { useState, useEffect } from "react"
import {
  User,
  Users,
  ChevronsUpDown,
  Logs,
  LogOut,
  Sparkles,
} from "lucide-react"
import useSWR from "swr"
import { signOut } from "@/app/(auth)/actions"
import { useRouter } from "next/navigation"
import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// 添加fetcher函数
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function NavUser() {
  const { data: user, error, isLoading } = useSWR('/api/user', fetcher)
  const { isMobile } = useSidebar()
  const router = useRouter()

  // 处理登出
  async function handleSignOut() {
    await signOut()
    router.refresh()
    router.push('/')
  }

  // 如果正在加载，可以显示一个简单的加载状态
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            {/* 加载状态UI */}
            <div className="animate-pulse flex items-center w-full">
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              <div className="ml-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // 如果没有用户数据或发生错误，重定向会sign-in页面
  if (!user || error) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" onClick={() => router.push('/sign-in')}>
            Sign In
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // 获取用户名首字母，确保安全访问
  const getInitial = () => {
    if (user.name && user.name.length > 0) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U"; // 默认值
  };

  // 用户数据加载成功，显示正常UI
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar || ""} alt={user.name || user.email || ""} />
                <AvatarFallback className="rounded-lg">
                  {getInitial()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name || user.email || "用户"}</span>
                <span className="truncate text-xs">{user.email || ""}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar || ""} alt={user.name || user.email || ""} />
                  <AvatarFallback className="rounded-lg">
                    {getInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name || user.email || "用户"}</span>
                  <span className="truncate text-xs">{user.email || ""}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User />
                <Link
                  href="/dashboard/account"
                  className="flex w-full items-center"
                >
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users />
                <Link href="/dashboard/team" className="flex w-full items-center">
                  Team
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Logs />
                <Link href="/dashboard/user-log" className="flex w-full items-center">
                  User Logs
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
