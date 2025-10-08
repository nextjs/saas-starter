import { Button } from '@/components/ui/button';
import { ArrowRight, FolderOpen, Upload } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
            Sunlighten
            <span className="block text-orange-500">Partner Storage</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Secure platform for partners to upload and manage Android tablet OTA images.
            Built with Next.js, PostgreSQL, and AWS S3 integration.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="text-lg rounded-full"
            >
              <Link href="/spaces">
                <FolderOpen className="mr-2 h-5 w-5" />
                View Spaces
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg rounded-full"
            >
              <Link href="/spaces/blaupunkt/upload">
                <Upload className="mr-2 h-5 w-5" />
                Upload Files
              </Link>
            </Button>
          </div>
        </div>
      </section>


      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to manage OTA images?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Sunlighten's Partner Storage provides everything you need to securely
                upload and manage Android tablet firmware updates. Streamline your OTA distribution
                process with our comprehensive platform.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg rounded-full"
              >
                <Link href="/spaces">
                  Get Started
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
