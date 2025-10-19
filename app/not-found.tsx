// 导入 Next.js 的 Link 组件，用于跳转到首页或其他正确路由
import Link from 'next/link';
// 导入 lucide-react 图标库的 CircleIcon，作为页面视觉提示
import { CircleIcon } from 'lucide-react';

/**
 * NotFound 组件是 Next.js app 路由下自动识别的 404 页面
 * 任何不存在的地址都会自动渲染这里的内容
 */
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <div className="max-w-md space-y-8 p-4 text-center">
        <div className="flex justify-center">
          {/* 圆形图标，增加错误提示的视觉效果 */}
          <CircleIcon className="size-12 text-orange-500" />
        </div>
        {/* 主要错误标题，清晰告知用户页面未找到 */}
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Page Not Found
        </h1>
        {/* 错误原因解释，帮助用户理解可能发生的问题 */}
        <p className="text-base text-gray-500">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        {/* 提供返回首页链接，帮助用户自救继续访问 */}
        <Link
          href="/"
          className="max-w-48 mx-auto flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
