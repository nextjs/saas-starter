import { SectionHeading } from './ui/section-heading';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "This SaaS starter kit saved us months of development time. We were able to launch our product in just a few weeks.",
      author: "Sarah Johnson",
      role: "CTO, TechFlow",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      quote: "The integration with Stripe was seamless. Setting up our subscription model was incredibly easy.",
      author: "David Chen",
      role: "Founder, DataPulse",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg"
    },
    {
      quote: "I'm not a technical founder, but I was able to get our MVP up and running quickly. The documentation is excellent.",
      author: "Michael Rodriguez",
      role: "CEO, StartupBoost",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    }
  ];

  return (
    <section className="py-10 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="What Our Customers Say"
          subtitle="Don't just take our word for it. Here's what people who have used our starter kit have to say."
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