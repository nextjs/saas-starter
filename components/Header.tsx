/**
 * 网站头部组件
 * 包含网站标志、导航菜单、用户菜单和主题切换按钮
 * 支持响应式设计，在移动设备上显示汉堡菜单
 */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sunrise, Home, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/app/(auth)/actions';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { ThemeToggle } from '@/components/theme-toggle';

import { SITE } from '@/lib/constants';

/**
 * SWR数据获取函数
 * 用于从API获取JSON数据
 */
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * 用户菜单组件
 * 显示用户头像和下拉菜单，包含仪表板链接和登出选项
 * 未登录时显示"Getting Started"按钮
 */
export function UserMenu() {
  // 控制下拉菜单的开关状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 获取当前用户数据
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  /**
   * 处理用户登出
   * 调用登出操作，刷新路由并重定向到首页
   */
  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  // 如果用户未登录，显示"Getting Started"按钮
  if (!user) {
    return (
      <>
        <Button asChild className="rounded-full">
          <Link href="/sign-in">Getting Started</Link>
        </Button>
      </>
    );
  }

  // 用户已登录，显示头像和下拉菜单
  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      {/* 头像作为下拉菜单触发器 */}
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          {/* 如果没有头像，显示邮箱首字母作为备用 */}
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* 下拉菜单内容 */}
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        {/* 仪表板链接 */}
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* 登出表单 */}
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 网站头部组件
 * 包含网站标志、导航菜单、用户菜单和主题切换按钮
 * 支持响应式设计，在移动设备上显示汉堡菜单
 */
export function Header() {
  // 控制移动端菜单的开关状态
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // 获取当前路径，用于高亮当前导航项
  const pathname = usePathname();

  // 导航菜单项配置
  const navItems = [
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/docs', label: 'Docs' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 头部主要内容 */}
        <div className="flex justify-between items-center">
          {/* 左侧：网站标志和桌面导航 */}
          <div className="flex items-center">
            {/* 网站标志 */}
            <Link href="/" className="flex items-center">
              <Sunrise className="h-6 w-6 text-orange-500" />
              <span className="ml-2 text-xl font-semibold text-foreground">{SITE.NAME}</span>
            </Link>

            {/* 桌面导航 - 在中等及以上屏幕显示 */}
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium ${
                    pathname === item.href
                      ? 'text-orange-500'  // 当前页面高亮
                      : 'text-muted-foreground hover:text-foreground'  // 非当前页面
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 移动端菜单按钮 - 仅在小屏幕显示 */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              <span className="sr-only">Open Menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />  // 关闭图标
              ) : (
                <Menu className="h-6 w-6" />  // 菜单图标
              )}
            </button>
          </div>

          {/* 用户菜单和主题切换 - 在中等及以上屏幕显示 */}
          <div className="hidden md:flex items-center space-x-4">
            <UserMenu />
            <ThemeToggle />
          </div>

        </div>

        {/* 移动端导航菜单 - 仅在小屏幕且菜单打开时显示 */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-4">
            {/* 导航链接 */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-2 text-base font-medium ${
                    pathname === item.href
                      ? 'text-orange-500'  // 当前页面高亮
                      : 'text-muted-foreground hover:text-foreground'  // 非当前页面
                  }`}
                  onClick={() => setMobileMenuOpen(false)}  // 点击后关闭菜单
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {/* 用户菜单和主题切换 */}
            <div className="mt-4 pt-4 border-t border-border">
              <UserMenu />
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
