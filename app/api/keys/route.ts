// app/api/keys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser, getApiKeys } from '@/lib/db/queries'; // Menggunakan fungsi yang dimodifikasi

export async function GET(request: NextRequest) {
  const user = await getUser(); // Memastikan user terautentikasi via Express.js
  if (!user) {
    return NextResponse.json({ status: false, message: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    // Mengambil kunci API melalui fungsi getApiKeys yang memanggil Express.js
    const apiKeys = await getApiKeys();
    
    // Asumsi respons dari getApiKeys sudah dalam format yang diinginkan
    // Jika tidak, Anda perlu memformatnya di sini.
    return NextResponse.json({
      status: true,
      creator: 'Nusantara AI', // Sesuaikan
      keys: apiKeys,
      _metadata: {
        processing_time: 0, // Tidak ada di sini, sudah di backend Express.js
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
    });
  } catch (error: any) {
    console.error('Kesalahan saat mengambil kunci API:', error);
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan tak terduga: ' + error.message }, { status: 500 });
  }
}
