export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">博客</h1>
      <p className="text-gray-600 mb-8">
        这里将是我们的博客内容。目前正在建设中...
      </p>
      <div className="grid gap-8">
        {/* 博客文章将在这里显示 */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">示例博客文章</h2>
          <p className="text-gray-500 text-sm mb-4">2023年12月1日</p>
          <p className="text-gray-600">
            这是一个示例博客文章的预览。完整内容即将推出...
          </p>
        </div>
      </div>
    </div>
  );
}
