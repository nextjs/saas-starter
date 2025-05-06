/**
 * 博客页面组件
 * 展示博客文章列表和预览
 */
export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <p className="text-gray-600 mb-8">
        Here you'll find our blog content.
      </p>
      <div className="grid gap-8">
        {/* 博客文章列表 */}
        <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Sample Blog Post</h2>
          <p className="text-gray-500 text-sm mb-4">May 1, 2025</p>
          <p className="text-gray-600">
            This is a preview of a sample blog post. Full content coming soon...
          </p>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">How to Build Apps Quickly with MCP SaaS Kit</h2>
          <p className="text-gray-500 text-sm mb-4">April 15, 2025</p>
          <p className="text-gray-600">
            In this article, we'll explore how to leverage the power of MCP SaaS Kit to quickly build and deploy your SaaS application...
          </p>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Best Practices for SaaS Applications</h2>
          <p className="text-gray-500 text-sm mb-4">April 22, 2025</p>
          <p className="text-gray-600">
            Building successful SaaS applications requires consideration of multiple factors. This article shares industry best practices to help you create excellent user experiences...
          </p>
        </div>
      </div>
    </div>
  );
}
