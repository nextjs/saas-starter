/**
 * 根布局组件
 * 为整个应用提供全局布局和配置
 * 包括主题、字体、SWR数据获取和通知提示
 */
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getUser, getTeamForUser } from "@/lib/db/queries";
import { SWRConfig } from "swr";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

/**
 * 网站元数据配置
 * 设置网站标题和描述，用于SEO和浏览器标签显示
 */
export const metadata: Metadata = {
  title: "MCP.Day - Ship your MCP SaaS in ONE DAY",
  description:
    "Build your MCP SaaS app with Next.js, Postgres and Stripe in ONE DAY",
};

/**
 * 视口配置
 * 控制移动设备上的视口行为
 */
export const viewport: Viewport = {
  maximumScale: 1, // 禁止用户放大，保持1:1的显示比例
};

/**
 * 字体配置
 * 使用Google Fonts的Manrope字体
 */
const manrope = Manrope({ subsets: ["latin"] });

/**
 * 根布局组件
 * 为整个应用提供全局布局和配置
 *
 * @param children - 子组件，将被渲染在布局中
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.className}`} // 应用Manrope字体
      suppressHydrationWarning // 抑制水合警告，解决客户端和服务器端渲染差异问题
    >
      <body className="min-h-[100dvh]">
        {" "}
        {/* 确保body至少占满整个视口高度 */}
        {/* 主题提供者 - 支持亮色/暗色主题切换 */}
        <ThemeProvider
          attribute="class" // 使用class属性控制主题
          defaultTheme="system" // 默认使用系统主题
          enableSystem // 启用系统主题检测
          disableTransitionOnChange // 禁用主题切换时的过渡动画，避免闪烁
        >
          {/* SWR配置 - 用于数据获取和缓存 */}
          <SWRConfig
            value={{
              fallback: {
                // 预获取用户和团队数据，提供初始状态
                "/api/user": getUser(),
                "/api/team": getTeamForUser(),
              },
            }}
          >
            {/* 主内容区域 */}
            <main className="flex-1">{children}</main>
            {/* 通知提示组件 */}
            <Toaster position="bottom-center" richColors />
          </SWRConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
