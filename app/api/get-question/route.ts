import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Bugünün tarihini YYYY-MM-DD formatında al
const getTodayDate = () => new Date().toISOString().split('T')[0];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fid = searchParams.get("fid");

  if (!fid) return NextResponse.json({ error: "FID gerekli" }, { status: 400 });

  const today = getTodayDate();

  // 1. Kullanıcının bugünkü cevabını kontrol et
  const { data: answerData, error: answerError } = await supabase
    .from("answers")
    .select("id, question_id")
    .eq("fid", fid)
    .eq("date", today);

  if (answerError) {
    console.error("Cevap çekme hatası:", answerError);
    return NextResponse.json({ error: "Veri tabanı hatası" }, { status: 500 });
  }

  if (answerData && answerData.length > 0) {
    // Kullanıcı zaten cevaplamış
    return NextResponse.json({ alreadyAnswered: true });
  }

  // 2. Bugünkü soruyu çek
  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("date", today)
    .single();

  if (questionError || !questionData) {
    console.error("Soru çekme hatası:", questionError);
    // Eğer bugün için soru yoksa
    return NextResponse.json({ error: "Bugün için soru bulunamadı." }, { status: 404 });
  }

  // Cevap şıkkını gizlemeden gönder (Frontend kontrol etmiyor)
  const { correct_option, ...questionWithoutAnswer } = questionData;
  return NextResponse.json(questionWithoutAnswer);
}
