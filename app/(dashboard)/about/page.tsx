import Link from "next/link";

export default function AboutPage() {
  return (
    <main>
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            About Last Layer
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            From idea to object. Make it real.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            We bring ideas into the physical world with custom 3D design and
            production—for products the world hasn&apos;t seen yet, and for the
            things you need made your way.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/develop"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Start a design
            </Link>
            <Link
              href="/services"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Explore our services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Ideas, designed for the real world
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              A new product starts with an idea and a set of questions. We help
              shape custom 3D designs and bring projects closer to something
              tangible, whether you&apos;re exploring a new concept or need a
              specific object made to suit your needs.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Have a project in mind?
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              Tell us what you&apos;re working on and we&apos;ll help you
              figure out what comes next.
            </p>
            <Link
              href="mailto:admin@lastlayer.ca"
              className="mt-5 inline-flex font-medium text-red-600 underline underline-offset-4 hover:text-red-700"
            >
              Contact us at admin@lastlayer.ca
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
