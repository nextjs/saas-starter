export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6">文档</h1>

      <div className="prose prose-orange max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          欢迎查阅 MCP.Day 的官方文档。这里您可以找到关于如何使用和配置我们平台的详细信息。
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">快速开始</h2>
            <p className="text-gray-600 mb-4">
              了解如何快速设置和开始使用 MCP.Day 平台。
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              即将推出
            </span>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">API 参考</h2>
            <p className="text-gray-600 mb-4">
              详细的 API 文档，包括所有端点和参数。
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              即将推出
            </span>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">集成指南</h2>
            <p className="text-gray-600 mb-4">
              学习如何将 MCP.Day 与其他服务和工具集成。
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              即将推出
            </span>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">最佳实践</h2>
            <p className="text-gray-600 mb-4">
              发现使用 MCP.Day 的最佳实践和技巧。
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              即将推出
            </span>
          </div>
        </div>

        <div className="mt-12 p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">常见问题</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg">MCP.Day 是什么？</h3>
              <p className="text-gray-600 mt-2">
                MCP.Day 是一个现代化的 SaaS 启动套件，帮助开发者在一天内构建和部署完整的 SaaS 应用。
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg">我需要具备哪些技术知识？</h3>
              <p className="text-gray-600 mt-2">
                基本的 React 和 Next.js 知识将有助于您更好地使用我们的平台，但我们的文档设计得足够简单，即使是初学者也能快速上手。
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg">如何获取支持？</h3>
              <p className="text-gray-600 mt-2">
                我们提供全面的文档支持和活跃的社区论坛。对于付费用户，我们还提供专业的技术支持服务。
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mt-12">
          我们的文档正在不断完善中。如果您有任何问题或需要帮助，请联系我们的支持团队。
        </p>
      </div>
    </div>
  );
}
