import { Button } from '@/components/ui/button';
import { ArrowRight, Info, Clock, BookOpen, Smartphone, Zap, Target, Shield } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faPenNib, faHandshake, faMoneyBillWave, faBrain, faBullhorn } from '@fortawesome/free-solid-svg-icons';

export default function HomePage() {
  return (
    <main className="mb-12">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center lg:text-left lg:col-span-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:leading-tight">
              Unleash the AI Advantage:
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Transform Your Future Today</span>
              </h1>
              <p className="mt-5 text-xl text-gray-600 leading-relaxed">
              Master artificial intelligence, double your income, and revolutionize your everyday life!
              Would you like me to create a few more alternatives with different angles or emphases?
              </p>
              <div className="mt-10 flex flex-col sm:justify-center lg:justify-start">
                <a
                  href="/quiz"
                >
                  <Button
                    size="lg"
                    className="text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200 px-6"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                {/* Trust avatars */}
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-blue-900 text-lg font-medium">More than 3000+ people joined</span>
                </div>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                <div className="bg-gray-800 flex items-center px-4 py-2 rounded-t-2xl">
                  <div className="bg-blue-600 w-6 h-6 flex items-center justify-center rounded-full">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <div className="ml-2 text-white text-lg font-semibold">AI Assistant</div>
                </div>
                <iframe
                  src="/terminal.htm"
                  className="w-full h-96 rounded-b-2xl"
                  title="AI Assistant Chat Simulation"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Smart Tools for Modern Creators & Entrepreneurs</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Turn Ideas Into Income with AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-drift bg-white p-8 rounded-2xl shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-100 to-teal-100 mb-6">
                <FontAwesomeIcon icon={faWrench} className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Productivity</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">Boost your daily efficiency with AI tools designed to simplify routine tasks, automate repetitive actions, and help you stay focused. Whether you're managing projects, handling emails, or organizing your schedule – AI can help you save time and stay in control.</p>
            </div>
            <div className="card-drift bg-white p-8 rounded-2xl shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-100 to-teal-100 mb-6">
                <FontAwesomeIcon icon={faPenNib} className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Content Creation</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">Effortlessly create engaging, high-quality content for your blog, website, or social media channels. AI writing assistants can help you brainstorm ideas, draft articles, generate headlines, and even optimize content for SEO – giving you more time to focus on your creativity.</p>
            </div>
            <div className="card-drift bg-white p-8 rounded-2xl shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-100 to-teal-100 mb-6">
                <FontAwesomeIcon icon={faHandshake} className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Affiliate Marketing</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">Use the power of AI to find profitable affiliate products, create compelling promotional content, and automate your marketing strategies. With the right tools, you can increase your affiliate income with less manual work and smarter targeting.</p>
            </div>
            <div className="card-drift bg-white p-8 rounded-2xl shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-100 to-teal-100 mb-6">
                <FontAwesomeIcon icon={faMoneyBillWave} className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Income Streams</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">Discover how to generate new online income streams by using AI tools to build digital products, automate services, or create scalable content. Whether you're just getting started or looking to grow your online business, AI can help you do more with less effort.</p>
            </div>
            <div className="card-drift bg-white p-8 rounded-2xl shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-100 to-teal-100 mb-6">
                <FontAwesomeIcon icon={faBrain} className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI-Powered Business</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">Transform your business with AI-driven automation and analytics. From managing customer data to optimizing workflows and predicting trends, AI helps you make faster, smarter decisions that reduce costs and unlock growth opportunities.</p>
            </div>
            <div className="card-drift bg-white p-8 rounded-2xl shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-100 to-teal-100 mb-6">
                <FontAwesomeIcon icon={faBullhorn} className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Marketing</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">Take your marketing to the next level using AI tools for ad creation, audience targeting, performance tracking, and social media automation. With real-time data and intelligent suggestions, you can connect with the right people and boost your sales more effectively.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Coursiv Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 flex flex-col md:flex-row items-center p-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900">Increase your income potential with Focus your AI</h2>
              <p className="mt-4 text-lg text-gray-600">Master essential digital skills and AI tools to work smarter, grow faster, and earn more.</p>
              <div className="mt-6 flex flex-col">
                <Button size="lg" className="text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3">
                  <a href="/quiz" className="flex items-center">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                {/* Trust avatars */}
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-blue-900 text-lg font-medium">More than 3000+ people joined</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
              {/* Avatar placeholders */}
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full" />
                <div className="h-16 w-16 bg-gray-200 rounded-full" />
                <div className="h-16 w-16 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why people choose AI Design Prompt Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center p-12">
              <div className="lg:col-span-6 flex justify-center mb-8 lg:mb-0">
                <div className="h-96 w-full max-w-md bg-gray-200 rounded-xl" />
              </div>
              <div className="lg:col-span-6 lg:pl-12">
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why people choose AI Design Prompt</h2>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl">Join a growing community of creators, freelancers, and entrepreneurs who use SkillForge AI to unlock the power of digital skills and artificial intelligence.</p>
                <div className="mt-10 space-y-8">
                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900">Learn on your terms</h3>
                      <p className="mt-2 text-gray-600">No fluff, no overwhelm. Just 15 minutes a day to build real, valuable skills—at your pace, no matter your background.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <BookOpen className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900">Tailored to your style</h3>
                      <p className="mt-2 text-gray-600">Whether you prefer listening, reading, or doing—our content comes in audio lessons, quick tutorials, and interactive mini-projects.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Smartphone className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900">Ready when you are</h3>
                      <p className="mt-2 text-gray-600">Access everything from your phone, tablet, or laptop. Learn anywhere, anytime—even offline.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Zap className="h-6 w-6 text-teal-500 mt-1 flex-shrink-0" />
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900">Results you can feel</h3>
                      <p className="mt-2 text-gray-600">Use powerful AI tools from day one. Build your portfolio, launch new projects, or start earning more—right as you learn.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900">Your journey with AI, simplified</h2>
          <p className="mt-4 text-lg text-gray-600">Explore practical lessons and real tools—on your schedule, at your pace.</p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <Target className="h-16 w-16 text-teal-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Step 1: Define your goals, unlock your path</h3>
                <p className="mt-1 text-gray-600">You set the direction—we'll take care of the roadmap. Once you define your learning goals, we build a personalized plan filled with the most relevant AI tools and skills to help you grow efficiently and stay inspired.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <BookOpen className="h-16 w-16 text-teal-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Step 2: Build real, useful skills</h3>
                <p className="mt-1 text-gray-600">Our lessons are built for action—not just theory. You'll learn by doing, using real tools and solving real problems that align with your personal learning path.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="h-16 w-16 text-teal-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Step 3: Use AI with confidence</h3>
                <p className="mt-1 text-gray-600">With the right tools and a clear plan, you'll start putting AI into action—confidently and creatively. Whether it's content creation, automation, or decision-making, you'll know exactly how to make AI work for you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-blue-500 to-blue-700 text-white overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-10 w-40 h-40 rounded-full bg-white blur-2xl"></div>
          <div className="absolute bottom-0 right-10 w-60 h-60 rounded-full bg-white blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="mb-12 lg:mb-0">
              <h2 className="text-4xl font-bold sm:text-5xl mb-6">Start Your Smart Learning Journey Today</h2>
              <p className="text-lg text-blue-100 max-w-2xl mb-10">
                Start your AI journey today – it only takes 15 minutes a day. With short, focused lessons and hands-on tools, you'll quickly build practical skills that fit your goals, your schedule, and your pace.
              </p>
              <div className="flex flex-col">
                <Button
                  size="lg"
                  className="bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 transition-all duration-200 rounded-full shadow-lg px-8 py-6 font-medium border border-blue-400"
                >
                  View Pricing
                </Button>
                {/* Trust avatars */}
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-white text-lg font-medium">More than 3000+ people joined</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-blue-600/30 backdrop-blur-md p-8 rounded-3xl border border-blue-400/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 w-full max-w-md">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/40 to-blue-700/40 hover:from-blue-500/50 hover:to-blue-700/50 transition-all duration-200 text-center shadow-lg">
                    <div className="text-4xl font-bold mb-1">3000+</div>
                    <div className="text-blue-100">Happy Users</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/40 to-blue-700/40 hover:from-blue-500/50 hover:to-blue-700/50 transition-all duration-200 text-center shadow-lg">
                    <div className="text-4xl font-bold mb-1">24/7</div>
                    <div className="text-blue-100">Support</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/40 to-blue-700/40 hover:from-blue-500/50 hover:to-blue-700/50 transition-all duration-200 text-center shadow-lg">
                    <div className="text-4xl font-bold mb-1">99.9%</div>
                    <div className="text-blue-100">Uptime</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/40 to-blue-700/40 hover:from-blue-500/50 hover:to-blue-700/50 transition-all duration-200 text-center shadow-lg">
                    <div className="text-4xl font-bold mb-1">7-day</div>
                    <div className="text-blue-100">Free Trial</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
        <p className="text-lg font-bold mb-2">Disclaimer</p>
        <p className="text-sm text-gray-600">
          Focus your AI serves exclusively as an educational platform and explicitly does not provide any financial, investment, or career advice under any circumstances. All content is presented for informational and educational purposes only. Prior to making any career or financial decisions, we strongly urge you to consult with qualified professional advisors. Focus your AI maintains absolute neutrality and has no bias whatsoever towards or against any stocks, companies, or entities mentioned throughout this platform. Nothing contained within this site should be interpreted as a recommendation or endorsement of any kind.
        </p>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <img src="/Logo_all.svg" alt="Logo" className="h-10 w-auto" />
            <nav className="flex flex-wrap space-x-4">
              <a href="/" className="text-gray-700 hover:text-gray-900">Home</a>
              <a href="/privacy" className="text-gray-700 hover:text-gray-900">Privacy Policy</a>
              <a href="/terms" className="text-gray-700 hover:text-gray-900">Terms & Conditions</a>
              <a href="/subscription-terms" className="text-gray-700 hover:text-gray-900">Subscription Terms</a>
              <a href="/support" className="text-gray-700 hover:text-gray-900">Support Center</a>
            </nav>
          </div>
        </div>
      </footer>
      <div className="text-center text-gray-500 text-sm mt-4">
        Product by DexterLab 2025 ©All Rights Reserved.
      </div>
    </main>
  );
}

