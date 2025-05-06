/**
 * 关于页面组件
 * 展示公司信息、团队和使命愿景
 */
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6">About MCP.Day</h1>

      <div className="prose prose-orange max-w-none">
        {/* 公司简介部分 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-600">
            MCP.Day was founded in 2023 with a simple mission: to help developers build and deploy complete SaaS applications in record time. We believe that technology should enable creativity, not hinder it with boilerplate code and repetitive tasks.
          </p>
          <p className="text-gray-600 mt-4">
            Our team of experienced developers and designers has created a powerful, ready-to-use template that incorporates modern technologies and best practices, allowing you to focus on what makes your product unique.
          </p>
        </section>

        {/* 使命和愿景部分 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Mission & Vision</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To empower developers to build high-quality SaaS products quickly and efficiently, without sacrificing customization or scalability.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">Our Vision</h3>
              <p className="text-gray-600">
                A world where technical founders can bring their ideas to market in days instead of months, with enterprise-grade architecture from day one.
              </p>
            </div>
          </div>
        </section>

        {/* 核心价值部分 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Speed</h3>
              <p className="text-gray-600">
                We value rapid development and quick iteration to bring ideas to life.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Quality</h3>
              <p className="text-gray-600">
                We never compromise on code quality, security, or user experience.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Innovation</h3>
              <p className="text-gray-600">
                We constantly explore new technologies and approaches to improve our platform.
              </p>
            </div>
          </div>
        </section>

        {/* 团队部分 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
          <p className="text-gray-600 mb-6">
            MCP.Day is built by a small but dedicated team of developers, designers, and product specialists who are passionate about creating tools that make developers' lives easier.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold text-xl">
                AH
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Anson Ho</h3>
                <p className="text-gray-500">Founder & Lead Developer</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-xl">
                HH
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Hubert Ho</h3>
                <p className="text-gray-500">Product Specialist</p>
              </div>
            </div>
          </div>
        </section>

        {/* 联系信息部分 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="text-gray-600">
            We'd love to hear from you! Whether you have questions about our platform, need support, or want to discuss partnership opportunities, our team is here to help.
          </p>
          <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600">
              <strong>Email:</strong> contact@mcp.day
            </p>
            <p className="text-gray-600 mt-2">
              <strong>GitHub:</strong> github.com/Anson2Dev/mcp-saas-kit
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Twitter:</strong> @mcpday
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}