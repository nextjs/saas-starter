'use client';

import { useParams } from 'next/navigation';
import { LyricEditor } from '@/components/editor';

export default function SongPage() {
  const params = useParams();
  const id = params.id as string;

  // In a real app, you'd fetch the song data based on id
  const songData = {
    title: id === '1' ? 'NEON SHADOWS' : id === '2' ? 'SUMMER BREEZE' : 'DIGITAL REBELLION',
    lyrics: `[VERSE 1]\nNeon lights reflect the rain\nDriving through the digital pain\nElectric hearts beat in the dark\nSearching for a human spark\n\n[CHORUS]\nOh, we're the ghosts in the machine\nLiving out a synthetic dream`
  };

  return (
    <div className="min-h-screen bg-black">
      <LyricEditor initialTitle={songData.title} initialLyrics={songData.lyrics} />
    </div>
  );
}
