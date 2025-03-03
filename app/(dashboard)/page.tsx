"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CreditCard,
  Database,
  CloudUpload,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

export default function HomePage() {
  const banks = [
    {
      name: "BNP Paribas",
      logo: "https://bankstatementwizard.com/_next/static/media/bnp_paribas.4f3fb75c.svg",
    },
    {
      name: "Bank of America",
      logo: "https://bankstatementwizard.com/_next/static/media/bank_of_america.b00ec101.svg",
    },
    {
      name: "Barclays",
      logo: "https://bankstatementwizard.com/_next/static/media/barclays.98b989f2.svg",
    },
    {
      name: "Citibank",
      logo: "https://bankstatementwizard.com/_next/static/media/citibank.c6845233.svg",
    },
    {
      name: "HSBC",
      logo: "https://bankstatementwizard.com/_next/static/media/hsbc.98c37690.svg",
    },
    {
      name: "UniCredit",
      logo: "https://bankstatementwizard.com/_next/static/media/unicredit.e3feb2c5.svg",
    },
  ];

  const faqs = [
    {
      question: "How does the conversion of the pdf to excel or csv work?",
      answer:
        "First, you'll upload your PDF bank statement through the converter's website. The converter will then extract the text from the PDF using OCR technology and organize it into structured data, including transaction dates, descriptions, amounts, and running totals. After that, the data is cleaned to ensure accuracy. You'll have the chance to review the converted data for any errors or inaccuracies, and once you're satisfied, you can download it in either Excel or CSV format.",
    },
    {
      question: "How is my data handled and processed?",
      answer:
        "We take data privacy very seriously. Your data is treated with the utmost care and respect. We use it solely for the purpose of converting your bank statements to the desired format (Excel or CSV), and we do not store your data beyond the duration of your session. Our system is designed to ensure that your sensitive financial information remains secure and confidential throughout the conversion process. You can learn more about our data privacy and security measures in our privacy policy, which outlines our commitment to safeguarding your information.",
    },
    {
      question: "Is this a subscription service? Can I cancel anytime?",
      answer:
        "Yes, this is a subscription service, but you can cancel anytime. We offer flexible plans that allow you to choose the best option for your needs. If you decide to cancel your subscription, you can do so at any time without any hassle. After canceling, you'll still have access to the service until the end of your billing cycle, so you can continue to use it until then.",
    },
    {
      question: "Which PDF formats are compatible with the service?",
      answer:
        "Our service supports a wide range of PDF formats, including digital, image, and scanned PDFs. Whether your bank statement is in a standard digital format, an image-based PDF, or a scanned document, our converter is designed to handle and process them effectively, allowing you to convert your bank statements to Excel or CSV with ease.",
    },
    {
      question: "Is it necessary to install any software?",
      answer:
        "No, you don't need to install any software. Everything runs directly in your web browser, making it a hassle-free and convenient experience.",
    },
    {
      question: "What is the pricing for this service?",
      answer:
        "The pricing for this service offers flexibility to suit your needs. We have a free plan that supports up to 10 pages per month. If you need more, our lowest paid plan starts at just $30 per month and allows you to convert up to 400 pages. We also offer larger plans for more extensive usage. It's important to note that by using our service, you not only save money but also valuable time that you'd otherwise spend manually entering data.",
    },
    {
      question: "How can I contact customer support?",
      answer:
        "If you have any questions, concerns, or feedback, you can reach out to our customer support team via email at support@bankstatementwizard.com. Our team is more than happy to assist you with any issues or inquiries you may have.",
    },
    // ... additional FAQs
  ];

  const [expandedFAQs, setExpandedFAQs] = useState<Record<number, boolean>>({});

  return (
    <main>
      {/* hero section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-18">
          <div className="lg:grid lg:grid-cols-12 lg:gap-28">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Convert Your BankStatements
                <span className="block text-blue-500">Faster Than Ever</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                No more manual data entry. No more copy and paste. No more Excel
                formulas. Just upload your bank statement PDF and we will
                convert it to Excel or CSV for you.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <a
                  href="/converter"
                  // target="_blank"
                >
                  <Button className="bg-blue-500 hover:bg-gray-100 text-white border hover:text-blue-500 border-gray-200 hover:border-blue-500 rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                    Open Converter
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="border-dashed border-2 border-gray-300 bg-blue-50 hover:bg-blue-100 h-75 w-120 rounded-lg flex flex-col items-center justify-center cursor-pointer">
                <CloudUpload className="h-20 w-20 text-blue-400 mb-4" />
                <p className="text-gray-500">
                  Click to upload or drag and drop
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* banks section */}
      <section className="py-16 bg-white w-full">
        <div className="overflow-hidden">
          <div className="py-16 sm:px-2">
            <div className="mx-auto flex mb-10 max-w-screen-xl items-center justify-center">
              <div className="grid max-w-6xl grid-cols-3 gap-4 items-center">
                <svg
                  width="100%"
                  height="2"
                  viewBox="0 0 100 1"
                  preserveAspectRatio="none"
                  className="self-center"
                >
                  <line
                    x1="0"
                    y1="50%"
                    x2="100"
                    y2="50%"
                    stroke="#ccc"
                    strokeWidth="1"
                  />
                </svg>
                <a
                  className="text-center font-inter font-medium text-gray-600 hover:underline hover:text-gray-800 self-center"
                  href="/banks"
                >
                  We convert statements from more than 600 banks worldwide
                </a>
                <svg
                  width="100%"
                  height="2"
                  viewBox="0 0 100 1"
                  preserveAspectRatio="none"
                  className="self-center"
                >
                  <line
                    x1="0"
                    y1="50%"
                    x2="100"
                    y2="50%"
                    stroke="#ccc"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
            <div className="mx-auto grid gap-8 max-w-screen-xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-18">
                {banks.map((bank, index) => (
                  <div key={index} className="flex items-center justify-center">
                    <img
                      src={bank.logo}
                      alt={`${bank.name} logo`}
                      className="h-15 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features section */}
      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="mt-0 bg-gradient-to-br from-gray-100 to-violet-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-300 text-white">
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <path
                    fill="currentColor"
                    d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"
                  />
                </svg>
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  No Compromise Security
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Every connection is 256-bit encrypted. We take your privacy
                  seriously. As an EU based company, we are bound by the
                  strictest data protection laws in the world. If you want us to
                  delete your data, we will do it immediatly. Also we are
                  required to do so by law.
                </p>
              </div>
            </div>

            <div className="mt-10 bg-gradient-to-br from-gray-100 to-sky-200 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-300 text-white">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium  text-gray-900">
                  Automatic Reconciliation with your Balance
                </h2>
                <p className="mt-2 text-base  text-gray-500">
                  We make it easy to check every transaction against your
                  balance. If something doesn't add up, we will let you know.
                </p>
              </div>
            </div>

            <div className="mt-10 bg-gradient-to-br from-gray-100 to-fuchsia-200 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-300 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Get valuable insights that inform
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  See the daily change in your balance. Get a breakdown of your
                  expenses and credits. Obivously, you can export all of this to
                  Excel or CSV.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* pricing plan section */}


      {/* FAQ section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index}>
                <button
                  className="w-full text-xl text-left flex justify-between items-center"
                  onClick={() =>
                    setExpandedFAQs((prev) => ({
                      ...prev,
                      [index]: !prev[index],
                    }))
                  }
                >
                  <span className="font-bold">{faq.question}</span>
                  {expandedFAQs[index] ? (
                    <MinusCircle className="flex-shrink-0" />
                  ) : (
                    <PlusCircle className="flex-shrink-0" />
                  )}
                </button>
                {expandedFAQs[index] && (
                  <p className="mt-2 text-lg text-gray-600">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
