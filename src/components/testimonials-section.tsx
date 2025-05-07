import { SectionHeading } from './ui/section-heading';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "I wasted 3 months building auth and payment systems for my last startup. With SaaSify, I launched our MVP in 2 weeks and focused on what actually matters—our core product.",
      author: "Sarah Johnson",
      role: "CTO, TechFlow",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      quote: "The Stripe integration alone saved me weeks of debugging and testing. I literally shipped a working subscription service in a single weekend.",
      author: "David Chen",
      role: "Solo Developer, DataPulse",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg"
    },
    {
      quote: "After burning through $15K on a failed custom build, I switched to SaaSify. Should have started here. The codebase is clean, well-documented, and easily extensible.",
      author: "Michael Rodriguez",
      role: "Technical Founder, StartupBoost",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    }
  ];

  return (
    <section className="py-10 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="From Developers Who've Been There"
          subtitle="Real experiences from technical founders who've used our starter kit."
          centered
        />
        
        <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
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
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 