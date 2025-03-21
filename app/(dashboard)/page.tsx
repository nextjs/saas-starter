'use client'
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Code, CreditCard, Database, Headphones, Home, MessageCircle, MessageSquare, Search } from "lucide-react";
import { Terminal } from "./terminal";
import { useState } from "react";

// Define services data array
const services = [
  {
    id: 1,
    name: "Instagram Bot",
    description: "Automated messaging and content scheduling for Instagram with engagement analytics.",
    price: "$49",
    category: "chatbots",
    type: "Pre-built",
    typeColor: "orange",
    gradient: "from-orange-400 to-orange-500",
    icon: <MessageSquare className="h-16 w-16 text-white" />,
    action: "Buy Now"
  },
  {
    id: 2,
    name: "WhatsApp Bot",
    description: "Customer service automation and lead qualification for WhatsApp Business.",
    price: "$59",
    category: "chatbots",
    type: "Pre-built",
    typeColor: "green",
    gradient: "from-green-400 to-green-500",
    icon: <MessageCircle className="h-16 w-16 text-white" />,
    action: "Buy Now"
  },
  {
    id: 3,
    name: "Restaurant AI Assistant",
    description: "Complete AI solution for handling reservations, menu inquiries, and customer feedback.",
    price: "$199",
    category: "ai",
    type: "Full Solution",
    typeColor: "blue",
    gradient: "from-blue-400 to-blue-500",
    icon: <Bot className="h-16 w-16 text-white" />,
    action: "Buy Now"
  },
  {
    id: 4,
    name: "Real Estate Lead Bot",
    description: "AI system for qualifying leads, scheduling viewings, and answering property questions 24/7.",
    price: "$249",
    category: "ai",
    type: "Full Solution",
    typeColor: "purple",
    gradient: "from-purple-400 to-purple-500",
    icon: <Home className="h-16 w-16 text-white" />,
    action: "Buy Now"
  },
  {
    id: 5,
    name: "Custom AI Development",
    description: "Tailored AI and chatbot solutions built specifically for your business needs.",
    price: "Contact us",
    category: "custom",
    type: "Custom",
    typeColor: "indigo",
    gradient: "from-indigo-400 to-indigo-500",
    icon: <Code className="h-16 w-16 text-white" />,
    action: "Get Quote"
  },
  {
    id: 6,
    name: "Maintenance & Support",
    description: "Ongoing updates, technical support, and performance optimization for your bots.",
    price: "From $29/mo",
    category: "custom",
    type: "Subscription",
    typeColor: "pink",
    gradient: "from-pink-400 to-pink-500",
    icon: <Headphones className="h-16 w-16 text-white" />,
    action: "Subscribe"
  }
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Filter services based on search query and selected category
  const filteredServices = services.filter(service => {
    const matchesQuery = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    
    return matchesQuery && matchesCategory;
  });
  
  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
  };
  
  // Handle category filter change
  const handleFilterChange = (value) => {
    setSelectedCategory(value);
  };

  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                AI Chatbot Solutions
                <span className="block text-orange-500">For Your Business</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Deploy powerful chatbots across multiple platforms to automate customer service, 
                qualify leads, and enhance user engagement - all with minimal setup time.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                  Explore Solutions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Our Services
          </h2>

          {/* Search and filter bar */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="chatbots">Chatbots</option>
                  <option value="ai">AI Solutions</option>
                  <option value="custom">Custom Development</option>
                </select>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Services grid - now using map to render dynamically */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-48 bg-gradient-to-r ${service.gradient} flex items-center justify-center`}>
                    {service.icon}
                  </div>
                  <div className="p-6">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold bg-${service.typeColor}-100 text-${service.typeColor}-800 rounded-full mb-2`}>
                      {service.type}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {service.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-orange-500">{service.price}</span>
                      <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">
                        {service.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
                <button 
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* View all services button */}
          <div className="mt-12 text-center">
            <button 
              className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 inline-flex items-center"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to automate your customer interactions?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Our AI-powered chatbots help businesses increase customer satisfaction, 
                generate more leads, and reduce support costs by up to 70%.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">24/7 customer support</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">Instant responses</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">Lead qualification</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">Analytics dashboard</p>
                </div>
              </div>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-full text-xl px-12 py-6 inline-flex items-center justify-center">
                Contact Sales
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}