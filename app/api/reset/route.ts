import { NextResponse } from "next/server";

export async function GET() {
  // Gece 00:00'da çalışacak Vercel Cron Job'lar için örnek bir dosya.
  // Bu uygulamada günlük cevaplar "answers" tablosundaki "date" alanı ile kontrol edildiği için
  // özel bir sıfırlama işlemi kodda gerekmiyor.
  // Ancak bu dosya, Supabase'de günlük olarak yeni soru ekleme veya puan tablosunu sıfırlama gibi
  // işlemler yapmak için Cron Job tetikleyicisi olarak kullanılabilir.

  return NextResponse.json({ message: "Sıfırlama API'si başarıyla tetiklendi. (Fonksiyonel bir kod içermiyor.)" });
}
