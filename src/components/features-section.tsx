import { CreditCard, Database, FlaskConical, Languages, LineChart, Palette, Server, Shield, UploadCloud } from 'lucide-react';
import { SectionHeading } from './ui/section-heading';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Styling & UI",
      description: "Beautiful, customizable UI with Tailwind CSS and shadcn/ui, designed for accessibility and speed."
    },
    {
      icon: <Languages className="h-6 w-6" />,
      title: "Internationalization (i18n)",
      description: "Built-in i18n support to reach users worldwide, with easy language switching and translation management."
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Data Fetching",
      description: "Optimized data fetching patterns using Next.js server components, caching, and error handling."
    },
    {
      icon: <Shield className="h-6 w-6" />, 
      title: "Authentication",
      description: "Secure, flexible authentication with social logins, passwordless, and robust permission management."
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Database & ORM",
      description: "Modern, scalable database setup with migrations, type safety, and easy querying for rapid development."
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Payments",
      description: "Integrated payments and subscriptions with Stripe, ready for global commerce and easy to extend."
    },
    {
      icon: <FlaskConical className="h-6 w-6" />,
      title: "Testing",
      description: "Comprehensive testing setup with unit, integration, and e2e support to ensure quality and confidence."
    },
    {
      icon: <UploadCloud className="h-6 w-6" />,
      title: "CI/CD",
      description: "Automated testing and deployment pipelines for fast, reliable shipping and continuous improvement."
    },
    {
      icon: <Server className="h-6 w-6" />,
      title: "Deployment",
      description: "Seamless deployment with Vercel, Docker, and production-ready configurations out of the box."
    }
  ];

  return (
    <section className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Everything You Need for Modern SaaS"
          subtitle="A complete toolkit of essential features, thoughtfully integrated so you can focus on what makes your product unique."
          centered
        />
        <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 