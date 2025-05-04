export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">文档</h1>
      
      <div className="prose prose-orange max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          欢迎查阅 MCP.Day 的官方文档。这里您可以找到关于如何使用和配置我们平台的详细信息。
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">快速开始</h2>
            <p className="text-gray-600 mb-4">
              了解如何快速设置和开始使用 MCP.Day 平台。
            </p>
            <span className="text-orange-500">即将推出</span>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">API 参考</h2>
            <p className="text-gray-600 mb-4">
              详细的 API 文档，包括所有端点和参数。
            </p>
            <span className="text-orange-500">即将推出</span>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">集成指南</h2>
            <p className="text-gray-600 mb-4">
              学习如何将 MCP.Day 与其他服务和工具集成。
            </p>
            <span className="text-orange-500">即将推出</span>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">最佳实践</h2>
            <p className="text-gray-600 mb-4">
              发现使用 MCP.Day 的最佳实践和技巧。
            </p>
            <span className="text-orange-500">即将推出</span>
          </div>
        </div>
        
        <p className="text-gray-600">
          我们的文档正在不断完善中。如果您有任何问题或需要帮助，请联系我们的支持团队。
        </p>
      </div>
    </div>
  );
}
