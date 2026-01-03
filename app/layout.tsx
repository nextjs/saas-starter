// 引入全局样式表，作用于整个 APP
import './globals.css';
// 导入 Next.js 中 Metadata（页面元信息）、Viewport 类型（用于响应式）
import type { Metadata, Viewport } from 'next';
// 导入 Google Fonts 字体加载器（Manrope 字体）
import { Noto_Sans_SC, Noto_Sans_JP, Manrope } from 'next/font/google';
// 导入用户/团队获取工具函数（通常用于数据预加载或 fallback 数据）
import { getUser, getTeamForUser } from '@/lib/db/queries';
// 导入 SWR 的全局 Provider，用于统一缓存和数据请求配置
import { SWRConfig } from 'swr';

// 配置页面的基础元数据（SEO 标题、简介、分享描述等）
export const metadata: Metadata = {
  title: 'FX',
  description: '樊宵（Fan Xiao），专注于AI与程序设计融合的创新开发，打造中日跨境B2B服务与智能化系统，让技术与创造力共同驱动未来。'
};

// 配置移动端 viewport 行为，这里禁止页面最大缩放超过 1（防止用户手动放大页面）
export const viewport: Viewport = {
  maximumScale: 1
};

// 加载 Manrope Web 字体，仅拉取 'latin'（英文字母）子集以加速加载
const manrope = Manrope({ subsets: ['latin'] , display: 'swap' });
const jp = Noto_Sans_JP({ display: 'swap' });
const sc = Noto_Sans_SC({ display: 'swap' });

/**
 * RootLayout 是所有页面外层的全局布局组件
 * @param children 所有实际页面内容会被当做 children 进行渲染
 */
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    // 设置网页语言为英语 html 元素，并加入自定义字体样式
    // 网站主体 body 设置亮/暗色主题自动切换
    // SWRConfig 配置全局数据缓存/fallback（首屏异步数据预热），所有子组件都能用
    <html
    lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              // 这里不 await，getUser() 和 getTeamForUser() 返回的是 Promise，只有真正用到才开始 suspend 等待
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {/* 渲染页面实际内容（即各路由对应的页面组件） */}
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
