import { Star } from 'lucide-react';
import { SectionHeading } from './ui/section-heading';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

export function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      quote: "Perfect starter for my SaaS. Clean code, great auth flow, and Stripe integration worked out of the box. Saved me weeks of setup time.",
      author: "Sarah Chen",
      role: "Founder, MetricWatch",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      rating: 5
    },
    {
      quote: "The TypeScript setup and component structure made it easy to add our custom features. Solid foundation for any B2B SaaS.",
      author: "Marcus Kim",
      role: "Lead Dev, PlanScope",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      rating: 5
    },
    {
      quote: "Documentation is excellent. Implemented our entire auth system in a day. The included admin dashboard saved us tons of time.",
      author: "Alex Rivera",
      role: "CTO, InvoicePilot",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      rating: 4
    },
    {
      quote: "Best React/Next.js starter I've used. The code quality is exceptional and the Stripe subscription logic just works.",
      author: "Emma Thompson",
      role: "Tech Lead, MailSync",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      rating: 5
    },
    {
      quote: "Great value for money. The included UI components are beautiful and the database setup was straightforward.",
      author: "James Wilson",
      role: "Founder, FormFlow",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      rating: 4
    },
    {
      quote: "Deployed our MVP in just 3 days. The authentication and team management features are robust and well-implemented.",
      author: "Nina Patel",
      role: "Founder, BuildBase",
      avatar: "https://randomuser.me/api/portraits/women/89.jpg",
      rating: 5
    },
  ];

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1 mb-3">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={16}
          className={`${
            index < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );

  return (
    <section className="py-10 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="They Shipped. You Can Too."
          subtitle="See how founders used SaaS Stack to launch real apps — faster than ever."
          centered
        />
        
        <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="h-12 w-12 rounded-full"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{testimonial.author}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <StarRating rating={testimonial.rating} />
              <p className="text-gray-700">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 