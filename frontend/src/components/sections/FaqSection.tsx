// ====================================================================
// 📊 [OMD-UI-FaqSection-0024] FaqSection ➔ FaqSection
// 🎯 @KICK  : 자주 묻는 질문(FAQ)의 목록을 바인딩하고 아코디언 컴포넌트를 호출하여 상태를 매핑하는 섹션
// 🛡️ @GUARD : openFaqIndex 상태를 통해 오직 하나의 질문만 열릴 수 있도록 토글 제어
// 🚨 @PATCH : **2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: 집중도 높은 760px 너비 아코디언 및 LDSG v5.0 고대비 타이포그래피/그린 포인트 적용
//             **2026-08-07** — 하드코딩된 faqs 상수를 DB API('/api/faqs') 호출 기반 동적 렌더링으로 마이그레이션
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 아코디언, Ice Blue 포인트)
//             **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 패치
// 🔗 @CALLS : FaqItem
// ====================================================================
"use client";

import { useState, useEffect } from "react";
import { FaqItem } from "@/components/ui/FaqItem";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export function FaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('/api/faqs');
        if (!res.ok) throw new Error('Failed to fetch FAQs');
        const data = await res.json();
        setFaqs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const [showAll, setShowAll] = useState(false);
  const displayedFaqs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <section
      id="faq"
      className="py-24 sm:py-32 bg-[#F2F0EB] dark:bg-[#15171A] border-y border-[#E2DFD8] dark:border-white/5 text-[#1A1A18] dark:text-[#E8ECE9]"
      style={{ fontFamily: "Pretendard, LineSeed, sans-serif" }}
    >
      <div className="max-w-[760px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6E3DB] dark:bg-zinc-800 text-[11px] font-bold text-[#1A1A18] dark:text-zinc-200 tracking-wider uppercase mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-[#111413] dark:text-white">
            자주 묻는 질문
          </h2>
          <p className="text-[#68716D] dark:text-zinc-400 text-base">
            궁금한 점이 있으신가요? 가장 자주 묻는 질문들을 모았습니다.
          </p>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-zinc-400 text-sm">불러오는 중...</div>
          ) : faqs.length > 0 ? (
            <>
              {displayedFaqs.map((faq, idx) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaqIndex === idx}
                  onToggle={() => toggleFaq(idx)}
                />
              ))}
              {faqs.length > 5 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-[#06C755] bg-[#06C755]/10 hover:bg-[#06C755]/15 border border-[#06C755]/20 transition-all"
                  >
                    {showAll ? '접기 ⬆' : `더보기 (${faqs.length - 5}개 더 있음) ⬇`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-zinc-400 text-sm">등록된 자주 묻는 질문이 없습니다.</div>
          )}
        </div>
      </div>
    </section>
  );
}
