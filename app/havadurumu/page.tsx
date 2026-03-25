import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hava Durumu',
  description: 'havadurumu.webm görüntüleyici'
};

export default function HavaDurumuPage() {
  return (
    <main className="min-h-[100dvh] bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <video
          className="w-full h-auto max-h-[85dvh] rounded-lg shadow-lg bg-black"
          controls
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/havadurumu.webm" type="video/webm" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>
        <p className="mt-3 text-sm text-white/70 text-center">
          /havadurumu.webm
        </p>
      </div>
    </main>
  );
}
