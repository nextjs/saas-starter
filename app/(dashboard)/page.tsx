import { ContactForm } from '@/components/contact-form';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="flex items-center justify-center p-24">
          <h1 className="text-4xl font-bold">Welcome to Next.js</h1>
        </section>
        
        {/* Contact Form Section */}
        <ContactForm />
      </div>
      
      {/* Footer will go here */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}