'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { SectionHeading } from './ui/section-heading';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 pb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4 text-left font-medium text-gray-900"
      >
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 pr-8">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function FAQSection() {
  const faqs = [
    {
      question: "How does the 7-day free trial work?",
      answer: "You can try our platform for free for 7 days. No credit card is required to start. After the trial period, you can choose to subscribe to one of our plans to continue using the service."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will remain active until the end of your current billing period."
    },
    {
      question: "Is there a limit to how many users I can add?",
      answer: "No, you can add as many team members as you need. Our pricing is per-user, so you'll only pay for the accounts you create."
    },
    {
      question: "Do you offer custom enterprise plans?",
      answer: "Yes, we offer custom enterprise plans for larger organizations with specific needs. Please contact our sales team for more information."
    },
    {
      question: "How secure is my data?",
      answer: "We take security seriously. All data is encrypted in transit and at rest. We follow industry best practices for securing your information."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle="Have questions? We've got answers. If you don't find what you're looking for, feel free to contact our support team."
          centered
        />
        
        <div className="mt-12">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
} 