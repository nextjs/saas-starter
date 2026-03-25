export type SliderVideo = {
  id: string;
  title: string;
  category: string;
  date: string;
  src?: string;
  siteUrl?: string;
  openInNewTab?: boolean;
};

export const videos: SliderVideo[] = [
  {
    id: "medusa-frontend.webm",
    title: "E-ticaret",
    category: "E-commerce",
    date: "March 2026",
    src: "/medusa-frontend.webm",
    siteUrl: "https://storefront-production-f35a.up.railway.app/dk/store",
  },
  {
    id: "havadurumu.webm",
    title: "Hava Durumu",
    category: "Weather",
    date: "March 2026",
    src: "/havadurumu.webm",
    siteUrl: "https://havadurumu-fawn.vercel.app/",
  },
  {
    id: "bursa-gunluk-kiralik-daireler.webm",
    title: "Bursa Günlük Kiralık Daireler",
    category: "Nature",
    date: "July 2022",
    src: "/bursa-gunluk-kiralik.webm",
    siteUrl: "https://bursagunlukkiralikdaireler.com/",
  },
  {
    id: "uzmantasimaci.webm",
    title: "Uzman Taşımacı",
    category: "Nature",
    date: "March 2026",
    src: "/uzmantasimaci.webm",
    siteUrl: "https://uzmantasimaci.com/",
  },
  {
    id: "benti-textile",
    title: "Benti Textile",
    category: "Nature",
    date: "August 2022",
    src: "/benti-textile.webm",
    siteUrl: "https://bentitextile.com/",
  },
];
