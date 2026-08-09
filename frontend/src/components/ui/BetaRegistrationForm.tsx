"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function BetaRegistrationForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/beta/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(data.message || "등록 중 오류가 발생했습니다.");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage("서버와 통신할 수 없습니다.");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-6 bg-green-50/50 backdrop-blur-md border border-green-200 rounded-2xl max-w-md mx-auto mb-16"
      >
        <CheckCircle2 size={40} className="text-green-500 mb-3" />
        <h3 className="text-lg font-bold text-green-900 mb-1">사전 등록 완료!</h3>
        <p className="text-sm text-green-700 text-center">
          베타 테스트 기간(8/10~8/25)에 맞춰 입력하신 이메일로<br />
          1년 Regular 플랜 라이선스를 보내드리겠습니다.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto mb-16 px-4">
      <div className="mb-4 text-center">
        <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full mb-2">
          🎁 얼리버드 특별 프로모션
        </span>
        <p className="text-sm font-semibold text-slate-700">
          8월 10일 ~ 8월 25일 베타 테스트 참가 시<br/>
          <span className="text-sky-600 font-bold">1년 Regular 플랜</span>을 무료로 드립니다!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full relative flex items-center shadow-lg rounded-full bg-white border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent transition-all">
        <input
          type="email"
          required
          placeholder="이메일 주소를 입력해주세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="w-full py-4 pl-6 pr-32 text-slate-700 outline-none bg-transparent placeholder-slate-400 text-sm sm:text-base"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="absolute right-1.5 top-1.5 bottom-1.5 bg-sky-500 hover:bg-sky-600 text-white px-5 sm:px-6 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "등록 중..." : (
            <>
              사전 등록 <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-500 font-medium">{message}</p>
      )}
    </div>
  );
}
