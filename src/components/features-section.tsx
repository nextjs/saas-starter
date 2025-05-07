import { Code, Globe, LineChart, Shield, UserPlus, Zap } from 'lucide-react';
import { SectionHeading } from './ui/section-heading';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="h-12 w-12 flex items-center justify-center rounded-md bg-orange-100 text-orange-600 mb-4">
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
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Built on Next.js for exceptional performance and SEO optimization out of the box."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Authentication",
      description: "Robust user authentication system with secure password handling and social login options."
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: "Team Management",
      description: "Invite team members, assign roles, and manage permissions with a few clicks."
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "Track user activity, monitor usage, and gain insights with built-in analytics."
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Developer Friendly",
      description: "Clean code structure, comprehensive documentation, and easy customization."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "API Integration",
      description: "Pre-built API endpoints and integration with popular third-party services."
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Powerful Features"
          subtitle="Everything you need to build, launch, and scale your SaaS product quickly and efficiently."
          centered
        />
        
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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