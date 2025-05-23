'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EarningsDisclaimerPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Earnings Disclaimer</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. No Income Guarantees</h2>
            <p className="mb-4">
              While we provide educational content and training designed to help you develop skills that may 
              lead to income-generating opportunities, we cannot and do not make any guarantees about your 
              ability to get results or earn any money with our ideas, information, tools, or strategies.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Individual Results May Vary</h2>
            <p className="mb-4">
              Any examples of earnings or income presented in our materials are not to be interpreted as a 
              promise or guarantee of earnings. Your level of success in attaining similar results depends 
              on a number of factors including but not limited to your background, experience, work ethic, 
              market conditions, and many other circumstances that are beyond our control.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. User Responsibility</h2>
            <p className="mb-4">
              You acknowledge that you are solely responsible for the results you obtain from the use of 
              the information provided in our educational materials. Your success depends on many factors, 
              including your dedication, work ethic, knowledge, skills, and various market variables.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Testimonials</h2>
            <p className="mb-4">
              Any testimonials or examples of results achieved are the exceptional results of a few individuals 
              and are not intended to be a guarantee that you or others will achieve the same results. 
              Individual results will vary and are entirely dependent on your use of the knowledge and skills taught.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Educational Purpose</h2>
            <p className="mb-4">
              Our content and courses are intended for educational purposes only. The information provided
              is to help you develop skills and knowledge in the subject areas covered. The application of 
              this information is your responsibility.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. No Professional Advice</h2>
            <p className="mb-4">
              Our educational materials do not constitute professional advice. We recommend that you consult
              with qualified professionals (accountants, lawyers, etc.) before making any financial, legal, 
              or business decisions based on the information provided in our courses.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Risk Disclosure</h2>
            <p className="mb-4">
              Any financial or business endeavor carries risks. You acknowledge and agree that you are fully 
              aware of the risks involved and that you are willing to take full responsibility for your own success.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Earnings Disclaimer, please contact us at legal@example.com.
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