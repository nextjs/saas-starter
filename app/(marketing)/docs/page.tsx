/**
 * 文档页面组件
 * 展示平台的官方文档和常见问题
 */
export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>

      <div className="prose prose-orange dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Welcome to the official documentation of MCP.Day. Here you can find detailed information about how to use and configure our platform.
        </p>

        {/* 文档卡片网格 - 2列布局 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* 快速开始卡片 */}
          <div className="p-6 border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">Quick Start</h2>
            <p className="text-muted-foreground mb-4">
              Learn how to quickly set up and start using the MCP.Day platform.
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
              Coming Soon
            </span>
          </div>

          {/* API参考卡片 */}
          <div className="p-6 border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">API Reference</h2>
            <p className="text-muted-foreground mb-4">
              Detailed API documentation, including all endpoints and parameters.
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
              Coming Soon
            </span>
          </div>

          {/* 集成指南卡片 */}
          <div className="p-6 border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">Integration Guide</h2>
            <p className="text-muted-foreground mb-4">
              Learn how to integrate MCP.Day with other services and tools.
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
              Coming Soon
            </span>
          </div>

          {/* 最佳实践卡片 */}
          <div className="p-6 border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">Best Practices</h2>
            <p className="text-muted-foreground mb-4">
              Discover best practices and tips for using MCP.Day.
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
              Coming Soon
            </span>
          </div>
        </div>

        {/* 常见问题区域 */}
        <div className="mt-12 p-6 border border-border rounded-lg shadow-sm bg-muted">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {/* FAQ项目1 */}
            <div>
              <h3 className="font-medium text-lg">What is MCP.Day?</h3>
              <p className="text-muted-foreground mt-2">
                MCP.Day is a modern SaaS starter kit that helps developers build and deploy complete SaaS applications in one day.
              </p>
            </div>

            {/* FAQ项目2 */}
            <div>
              <h3 className="font-medium text-lg">What technical knowledge do I need?</h3>
              <p className="text-muted-foreground mt-2">
                Basic knowledge of React and Next.js will help you better use our platform, but our documentation is designed to be simple enough for beginners to quickly get started.
              </p>
            </div>

            {/* FAQ项目3 */}
            <div>
              <h3 className="font-medium text-lg">How can I get support?</h3>
              <p className="text-muted-foreground mt-2">
                We provide comprehensive documentation support and an active community forum. For paid users, we also offer professional technical support services.
              </p>
            </div>
          </div>
        </div>

        {/* 页脚说明 */}
        <p className="text-muted-foreground mt-12">
          Our documentation is constantly being improved. If you have any questions or need help, please contact our support team.
        </p>
      </div>
    </div>
  );
}
