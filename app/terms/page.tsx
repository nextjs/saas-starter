'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex space-x-4">
          <Button variant="outline" className="gap-2" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button asChild variant="outline" className="gap-2">
            <Link href="/login/sign-in">
              Back to Sign In
            </Link>
          </Button>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to our learning platform. These Terms and Conditions govern your use of our website, 
              services, and content. By accessing our website or using our services, you agree to be bound 
              by these Terms and Conditions.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>"Service"</strong> refers to the learning platform provided by our company.</li>
              <li><strong>"User"</strong> refers to any individual accessing or using our service.</li>
              <li><strong>"Content"</strong> refers to all materials, information, and resources made available through our service.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
            <p className="mb-4">
              When you create an account with us, you must provide accurate, complete, and current 
              information. You are responsible for safeguarding your password and for all activities 
              that occur under your account.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Content and Licensing</h2>
            <p className="mb-4">
              All content provided on our platform is owned by us or licensed to us. This content is 
              protected by copyright, trademark, and other intellectual property laws. Users may access 
              and use the content for personal, non-commercial educational purposes only.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Acceptable Use</h2>
            <p className="mb-4">
              You agree not to use our service for any illegal purpose or in violation of any local, 
              state, national, or international law. You also agree not to reproduce, duplicate, copy, 
              sell, resell, or exploit any portion of the service without express written permission.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account and access to our service immediately, without 
              prior notice or liability, for any reason, including without limitation if you breach the 
              Terms and Conditions.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify or replace these Terms and Conditions at any time. It is 
              your responsibility to review these Terms and Conditions periodically for changes.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms and Conditions, please contact us at 
              support@example.com.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Product by DexterLab 2025 ©All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
} 