import NavbarDemo from "@/components/navbar-menu-demo";
import PhotosGallerySection, {
  type GalleryPhoto,
} from "@/components/photos-gallery/PhotosGallerySection";
import Slider from "@/components/slider/Slider";
import Link from "next/link";
import { CircleIcon } from "lucide-react";

const galleryPhotos: GalleryPhoto[] = [];

export default function FirmaWebsiteProjeleriPage() {
  return (
    <main className="min-h-screen bg-gray-200">
      <div className="fixed inset-x-0 top-6 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <CircleIcon className="h-6 w-6 text-orange-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">Ajans 99</span>
          </Link>
        </div>
      </div>
      <NavbarDemo />
      <PhotosGallerySection
        className="pt-40 pb-16"
        title="Website Projeleri"
        description="Aşağıdaki galeride web ve mobil projelerimizden seçili örnekleri bulabilirsin."
        photos={galleryPhotos}
      />

      <section className="bg-gray-900 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            Öne Çıkan Videolar
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-300">
            Kartları değiştirmek için slider alanına tıklayabilirsin.
          </p> */}
        </div>
        <Slider />
      </section>
    </main>
  );
}
