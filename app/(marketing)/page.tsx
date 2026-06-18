import { Button } from '@/components/ui/button';
import {
  Check,
  ClipboardCheck,
  ClipboardList,
  Download,
  ShieldCheck,
  Smartphone,
  Users
} from 'lucide-react';

const complianceBadges = [
  'AS9100D',
  'ISO 13485',
  'ITAR',
  'CMMC L1',
  'FAR/DFARS',
  'ISO 9001'
];

const features = [
  {
    icon: ClipboardList,
    title: 'Digital Job Travelers',
    description:
      'Replace paper travelers with structured digital records for every part — operations, quantities, and revision history in one place.'
  },
  {
    icon: ClipboardCheck,
    title: 'Inspection Sign-offs',
    description:
      'Capture pass/fail results, inspector identity, and timestamps at each operation. No more illegible signatures on clipboards.'
  },
  {
    icon: Download,
    title: 'One-Click PDF Export',
    description:
      'Generate print-ready traveler PDFs on demand — complete with operations, inspections, and sign-offs for auditors.'
  },
  {
    icon: ShieldCheck,
    title: 'Audit-Ready Records',
    description:
      'Tamper-evident revision history and complete traceability from job open to archive. Built for AS9100, ISO 13485, and ITAR audits.'
  },
  {
    icon: Users,
    title: 'Team Scoping',
    description:
      'Separate data by team or program so contract work stays isolated. Operators see only the jobs they need on the floor.'
  },
  {
    icon: Smartphone,
    title: 'Works on the Shop Floor',
    description:
      'Sign off inspections from a tablet or phone at the machine. No desktop required — works where your operators actually work.'
  }
];

const steps = [
  {
    number: '01',
    title: 'Open a job',
    description:
      'Create a digital traveler with part number, revision, and routing — or import from your existing workflow.'
  },
  {
    number: '02',
    title: 'Add operations',
    description:
      'Define each operation in sequence with work centers, specs, and inspection requirements.'
  },
  {
    number: '03',
    title: 'Sign off as work completes',
    description:
      'Operators and inspectors record completion and pass/fail results with timestamps at the machine.'
  },
  {
    number: '04',
    title: 'Export and archive',
    description:
      'One-click PDF export gives auditors a complete, tamper-evident paper trail — ready when they ask.'
  }
];

function HeroButtons({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <a href="/sign-up">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
          >
            Start Free Trial
          </Button>
        </a>
        <a href="/pricing">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            View Pricing
          </Button>
        </a>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        No credit card required · 14-day free trial
      </p>
    </div>
  );
}

export default function MarketingPage() {
  return (
    <main>
      {/* HERO */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
              Built for precision machine shops
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Digital Job Travelers. Audit-Ready from Day One.
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl leading-relaxed">
              OpsTrace replaces paper travelers with a structured digital
              record — operations, inspection sign-offs, and revision history
              — ready for AS9100, ISO 13485, and ITAR compliance audits.
            </p>
            <HeroButtons className="mt-10" />
          </div>
        </div>
      </section>

      {/* COMPLIANCE STRIP */}
      <section className="bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-600 mb-6">
            Trusted by shops doing defense, aerospace &amp; medical contract
            work
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {complianceBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm ring-1 ring-gray-200"
              >
                <Check className="h-4 w-4 text-orange-600 shrink-0" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Paper travelers fail audits. Clipboards lose traceability.
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            When an auditor asks for the complete record on a part — every
            operation, every inspection, every revision — paper travelers
            fall apart. Signatures get smudged, pages go missing, and there is
            no tamper-evident history. Shops doing defense, aerospace, and
            medical contract work need records that prove what was done, who
            signed off, and when — without scrambling the night before the
            audit.
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600 text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-16">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <span className="text-6xl font-bold text-orange-600/20 leading-none">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-base text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-orange-600 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stop hoping the auditor doesn&apos;t ask for the paper trail.
          </h2>
          <p className="mt-6 text-lg text-orange-100 leading-relaxed">
            Replace clipboards with digital travelers your team will actually
            use on the floor — and records auditors can trust from day one.
          </p>
          <div className="mt-10 flex flex-col items-center">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50"
                >
                  Start Free Trial
                </Button>
              </a>
              <a href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-orange-700 hover:text-white bg-transparent"
                >
                  View Pricing
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-orange-100">
              No credit card required · 14-day free trial
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
