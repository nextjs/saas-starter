import heroImage from '@/public/hero.jpg';
import Image from "next/image";
import AvailabilityCheck from '@/components/availability-check';

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-blue-950/80 clip-path-hero z-0"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Schnelles Internet für die Region</h1>
              <p className="text-xl mb-8">#vernetzt - wir verbinden Menschen</p>
            </div>
            <div className="hidden md:block">{/* This div is intentionally empty to maintain the layout */}</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full z-0">
          <Image src={heroImage} alt="Person using tablet" fill className="object-cover object-center" priority />
        </div>
      </section>
      <section className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <AvailabilityCheck />
        </div>
      </section>
    </main>
  );
}
