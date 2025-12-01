import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const getTodayDate = () => new Date().toISOString().split('T')[0];

export async function POST(req: Request) {
  const { fid, question_id, answer } = await req.json();

  if (!fid || !question_id || !answer) {
    return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
  }

  const today = getTodayDate();

  // 1. Sorunun doğru cevabını çek
  const { data: questionData, error: qError } = await supabase
    .from("questions")
    .select("correct_option")
    .eq("id", question_id)
    .single();

  if (qError || !questionData) {
    return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });
  }

  const isCorrect = questionData.correct_option === answer;
  const score = isCorrect ? 10 : 0;

  // 2. Cevabı kaydet (Önce bugünün cevabı var mı kontrolü yapılmış olsa da tekrar kontrol etmek iyi bir pratik)
  const { data: existingAnswer } = await supabase
    .from("answers")
    .select("*")
    .eq("fid", fid)
    .eq("date", today);

  if (existingAnswer && existingAnswer.length > 0) {
    return NextResponse.json({ error: "Bugün zaten cevapladınız." }, { status: 403 });
  }


  const { error: insertError } = await supabase.from("answers").insert([
    {
      fid,
      question_id,
      date: today,
      user_answer: answer,
      is_correct: isCorrect,
    },
  ]);

  if (insertError) {
    console.error("Cevap kaydetme hatası:", insertError);
    return NextResponse.json({ error: "Cevap kaydedilemedi" }, { status: 500 });
  }

  // 3. Kullanıcının puanını güncelle (isCorrect ise 10 puan ekle)
  if (isCorrect) {
      const { error: rpcError } = await supabase.rpc('update_user_score', { user_fid: fid, score_to_add: score });
      if (rpcError) {
          console.error("Puan güncelleme hatası:", rpcError);
          // Hata olsa bile kullanıcıya doğru cevabı gösteririz.
      }
  }


  return NextResponse.json({ correct: isCorrect, score });
}
