// app/api/user/route.ts
import { getUser } from '@/lib/db/queries'; // Menggunakan fungsi yang dimodifikasi
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getUser(); // Mengambil data user dari backend Express.js
  return NextResponse.json(user);
}
