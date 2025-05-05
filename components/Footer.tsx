/**
 * 网站页脚组件
 * 包含版权信息和重要链接（条款、隐私政策、联系方式）
 * 支持响应式设计，在小屏幕上垂直排列，在中等及以上屏幕水平排列
 */
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页脚内容容器 - 在小屏幕上垂直排列，中等及以上屏幕水平排列 */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* 左侧：版权信息 */}
          <div className="flex items-center mb-4 md:mb-0">
            <span className="ml-2 text-sm text-muted-foreground">
              MCP.Day © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>

          {/* 右侧：重要链接 */}
          <div className="flex space-x-6">
            {/* 条款链接 */}
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            {/* 隐私政策链接 */}
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            {/* 联系方式链接 */}
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
