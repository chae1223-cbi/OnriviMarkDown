// ====================================================================
// 📊 [OMD-SUPPORT-contact-0001] page ➔ ContactPage
// 🎯 @KICK  : Luminous Arctic 글래스모피즘 테마가 적용된 회원/비회원 전용 온라인 문의 접수 페이지
// 🛡️ @GUARD : 필수 값(이름, 이메일, 제목, 문의 내용) 유효성 검증 및 API 통신 오류 방어 가드
// 🚨 @PATCH : **2026-06-28** — 신규 개설: Brevo SMTP 연동 기반 문의하기 페이지 UI 완성
// 🔗 @CALLS : Navbar, Footer, useToast, useRouter, fetch
// ====================================================================
"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ContactPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("general"); // general: 일반문의, billing: 요금/결제, tech: 기술지원, suggestion: 제안/건의
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("이름을 입력해 주세요.", "warning");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      showToast("올바른 이메일 주소를 입력해 주세요.", "warning");
      return;
    }
    if (!title.trim()) {
      showToast("문의 제목을 입력해 주세요.", "warning");
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      showToast("문의 내용을 최소 10자 이상 작성해 주세요.", "warning");
      return;
    }

    setLoading(true);

    try {
      // 🚨 정적 내보내기(output: 'export') 환경에서는 Next.js POST API 라우트가 작동하지 않으므로,
      // 프론트엔드에서 직접 Supabase DB에 문의 접수 내역을 기록합니다.
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc("insert_support_inquiry", {
        p_name: name.trim(),
        p_email: email.trim(),
        p_type: type,
        p_title: title.trim(),
        p_content: content.trim(),
        p_user_id: session?.user?.id || null
      });

      if (rpcError) throw new Error("문의 사항을 데이터베이스에 저장하는 중 오류가 발생했습니다.");
      if (rpcResult && rpcResult.success === false) throw new Error(`데이터베이스 기록 실패: ${rpcResult.error}`);

      // 📝 참고: 정적 웹 앱에서는 브라우저에 API Key가 노출될 위험이 있어
      // 이메일 즉시 발송(Brevo) 로직은 여기서 제외되거나 향후 Supabase Edge Function으로 이관해야 합니다.

      showToast("문의가 성공적으로 접수되었습니다. 최대한 빠른 시일 내에 답변해 드리겠습니다.", "success");
      
      // 입력 폼 초기화
      setName("");
      setEmail("");
      setType("general");
      setTitle("");
      setContent("");

      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      console.error("[Contact] 문의 전송 오류:", err);
      showToast(err.message || "문의 전송 중 예기치 않은 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-950 text-on-surface dark:text-gray-100 font-sans transition-colors duration-200">
      {/* 구글 폰트 및 Material Symbols 로드 */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <Navbar />

      {/* 본문 영역 */}
      <main className="flex-grow flex items-center justify-center px-4 pt-32 pb-24 relative z-10">
        {/* 아름다운 백그라운드 그라데이션 블러 데코 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-200/40 dark:bg-sky-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div 
          className="max-w-2xl w-full bg-white/70 dark:bg-gray-900/60 border border-white/40 dark:border-gray-800/40 rounded-3xl p-8 md:p-10 backdrop-blur-md"
          style={{
            boxShadow: "8px 8px 24px rgba(0, 0, 0, 0.03), -8px -8px 24px rgba(255, 255, 255, 0.8)"
          }}
        >
          <section className="space-y-6">
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-sky-500 text-5xl mb-2">mail</span>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">문의하기</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                궁금하신 점이나 서비스 제안이 있으신가요? 내용을 접수해 주시면 기재하신 이메일 주소로 신속하게 답변해 드립니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 이름 입력 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">이름 / 단체명</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                    disabled={loading}
                  />
                </div>

                {/* 이메일 입력 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">답변받을 이메일 주소</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@onrivi.com"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 문의 유형 선택 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">문의 유형</label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    <option value="general">일반 문의 / 기타</option>
                    <option value="billing">요금제 / 결제 / 환불 문의</option>
                    <option value="tech">기술 지원 / 오류 제보</option>
                    <option value="suggestion">서비스 건의 / 파트너 제휴</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              {/* 제목 입력 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">문의 제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문의사항의 제목을 입력해 주세요."
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                  disabled={loading}
                />
              </div>

              {/* 상세 내용 입력 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">상세 문의 내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="문의하실 구체적인 내용을 작성해 주세요. (최소 10자 이상)"
                  rows={6}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm resize-none"
                  disabled={loading}
                />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-md hover:shadow-lg active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    문의 전송 중...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">send</span>
                    문의 제출하기
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
