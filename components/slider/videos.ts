export type SliderVideo = {
  id: string;
  title: string;
  category: string;
  date: string;
  src?: string;
};

export const videos: SliderVideo[] = [
  {
    id: "711863471",
    title: "Cineprint",
    category: "Documentary",
    date: "May 2022",
  },
  {
    id: "478246234",
    title: "Yosemite",
    category: "Sci-Fi",
    date: "June 2022",
  },
  {
    id: "387407107",
    title: "Orihima",
    category: "Art",
    date: "July 2022",
  },
  {
    id: "bursa-gunluk-kiralik-daireler",
    title: "Bursa Günlük Kiralık Daireler",
    category: "Nature",
    date: "August 2022",
    src: "/bursa-gunluk-kiralik-daireler-1920x1080.webm",
  },
];
