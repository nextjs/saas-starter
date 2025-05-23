'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="mb-4">
              We respect your privacy and are committed to protecting your personal data. This privacy policy informs 
              you about how we look after your personal data when you visit our website and tells you about your 
              privacy rights and how the law protects you.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
            <p className="mb-2">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, contact details when you register for an account.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services.</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, browser plug-in types, operating system, and platform.</li>
              <li><strong>Learning Data:</strong> Your progress through courses, quiz results, and completed lessons.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <p className="mb-2">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal data against accidental or 
              unlawful destruction, loss, alteration, unauthorized disclosure, or access. We regularly review 
              our security practices to ensure the ongoing security of our systems.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Cookies</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to track the activity on our service and hold 
              certain information. Cookies are files with small amounts of data which may include an anonymous 
              unique identifier.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Your Data Protection Rights</h2>
            <p className="mb-2">Under certain circumstances, you have rights under data protection laws in relation to your personal data:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The right to access your personal data</li>
              <li>The right to rectification of your personal data</li>
              <li>The right to erasure of your personal data</li>
              <li>The right to restrict processing of your personal data</li>
              <li>The right to data portability</li>
              <li>The right to object to processing</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "last updated" date.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at privacy@example.com.
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