// ====================================================================
// 📊 [OMD-UI-FaqSection-0024] FaqSection ➔ FaqSection
// 🎯 @KICK  : 자주 묻는 질문(FAQ)의 목록을 바인딩하고 아코디언 컴포넌트를 호출하여 상태를 매핑하는 섹션
// 🛡️ @GUARD : openFaqIndex 상태를 통해 오직 하나의 질문만 열릴 수 있도록 토글 제어
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 아코디언, Ice Blue 포인트)
//             **2026-08-07** — 하드코딩된 faqs 상수를 DB API('/api/faqs') 호출 기반 동적 렌더링으로 마이그레이션
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
      style={{ padding: "96px 0", background: "rgba(255,255,255,0.7)", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[760px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <span style={{ display: "inline-block", marginBottom: 16, padding: "4px 16px", borderRadius: 9999, background: "rgba(125,211,252,0.2)", color: "#006591", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
            FAQ
          </span>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 600, letterSpacing: "-0.01em", color: "#0f172a", marginBottom: 12 }}>
            자주 묻는 질문
          </h2>
          <p style={{ fontSize: 18, color: "#3e4850", lineHeight: "28px" }}>
            결제 전 가장 망설이는 질문들을 선제적으로 해결해 드립니다.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div className="text-center py-10 text-gray-500">불러오는 중...</div>
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
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    onClick={() => setShowAll(!showAll)}
                    style={{
                      padding: "8px 24px",
                      borderRadius: 9999,
                      background: "rgba(14,165,233,0.1)",
                      color: "#0284c7",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(14,165,233,0.2)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "rgba(14,165,233,0.1)"}
                  >
                    {showAll ? '접기 ⬆' : `더보기 (${faqs.length - 5}개 더 있음) ⬇`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">등록된 자주 묻는 질문이 없습니다.</div>
          )}
        </div>
      </div>
    </section>
  );
}
