import { Button } from "@/components/ui/button";
import Carousel from "@/components/Components/Carousel/Carousel";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default async function HomePage() {
  return (
    <div className="text-primary w-full h-full">
      <div className="w-full h-full">
        <div className="w-full h-full relative z-1">
          <section className="w-full p-4 pr-0 md:p-8">
            <div className="w-full h-full flex flex-col gap-2 mb-4">
              <h1 className="text-xl font-bold">Start Creating!</h1>
              <h2 className="text-slate-400 text-lg">
                Check out the effects of your kol split
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="foreground"
                className="p-4 rounded-md hover:bg-primary hover:text-white border"
              >
                <span className="text-base font-bold">I'm a KOL.</span>
              </Button>
              <Button
                variant="foreground"
                className="p-4 rounded-md hover:bg-primary hover:text-white border"
              >
                <span className="text-base font-bold">
                  I'm a Project Owner.
                </span>
              </Button>
            </div>
          </section>
          <div className="px-4 md:px-8 my-4">
            <h2 className="text-lg font-bold">Learn how to use KolAgent.ai</h2>
          </div>
          <section className="w-full px-4 md:px-8 !pr-96">
            <ScrollArea className="w-full">
              <Carousel
                baseWidth={600}
                autoplay={true}
                autoplayDelay={3000}
                pauseOnHover={true}
                loop={true}
                round={false}
              />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        </div>
      </div>
    </div>
  );
}
