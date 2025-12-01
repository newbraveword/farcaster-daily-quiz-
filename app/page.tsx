"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Home() {
  const [fid, setFid] = useState<number | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("fid");
    if (stored) setFid(Number(stored));
  }, []);

  async function loadQuestion() {
    if (!fid) return alert("Lütfen FID gir.");
    setLoading(true);
    try {
      const res = await axios.get(`/api/get-question?fid=${fid}`);
      if (res.data.alreadyAnswered) setStatus("answered");
      else setQuestion(res.data);
    } catch (e) {
      alert("Soru alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer(opt: string) {
    if (!question) return;
    const res = await axios.post("/api/submit-answer", { fid, question_id: question.id, answer: opt });
    setResult(res.data);
    setStatus(res.data.correct ? "correct" : "wrong");
  }

  if (!fid)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0c] text-white p-6">
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-[#0f1724] to-[#071029] border border-neutral-800 shadow-2xl">
          <h1 className="text-2xl font-semibold text-center mb-4">Günlük Crypto Quiz</h1>
          <p className="text-sm text-neutral-400 text-center mb-6">Farcaster FID’nizi girin (geçici auth)</p>
          <div className="flex gap-2">
            <input id="fid" className="flex-1 p-3 rounded-lg bg-[#071026] border border-neutral-800" placeholder="FID" />
            <button className="px-4 rounded-lg bg-white text-black" onClick={() => { const v = (document.getElementById("fid") as HTMLInputElement).value; if (v) { localStorage.setItem("fid", v); setFid(Number(v)); }}}>Kaydet</button>
          </div>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#040406] text-white p-6">
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-[#071026] to-[#04101a] border border-neutral-800 shadow-2xl">
        <h1 className="text-2xl font-semibold text-center mb-4">Günlük Crypto Quiz</h1>

        {status === "answered" && <p className="text-center text-neutral-400">Bugün zaten soru çözdün. Yarın tekrar gel.</p>}

        {!question && status !== "answered" && <div className="text-center"><button onClick={loadQuestion} className="mt-4 px-6 py-3 rounded-xl bg-white text-black">Bugünün Sorusu</button></div>}

        {question && (
          <div className="mt-6">
            <p className="text-neutral-300 mb-4">{question.question_text}</p>
            {["a","b","c"].map((opt) => (
              <button key={opt} onClick={() => submitAnswer(opt)} className="w-full text-left p-3 mb-3 rounded-lg bg-[#0b1220] border border-neutral-800">{question[`option_${opt}`]}</button>
            ))}
          </div>
        )}

        {status === "correct" && <p className="mt-4 text-green-400 text-center">Tebrikler — doğru! +10 puan</p>}
        {status === "wrong" && <p className="mt-4 text-red-400 text-center">Yanlış :( Yarın tekrar dene</p>}
      </motion.div>
    </div>
  );
}
