// ====================================================================
// 📊 [OMD-UI-FaqSection-0024] FaqSection ➔ FaqSection
// 🎯 @KICK  : 자주 묻는 질문(FAQ)의 목록을 바인딩하고 아코디언 컴포넌트를 호출하여 상태를 매핑하는 섹션
// 🛡️ @GUARD : openFaqIndex 상태를 통해 오직 하나의 질문만 열릴 수 있도록 토글 제어
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 아코디언, Ice Blue 포인트)
// 🔗 @CALLS : FaqItem, constants
// ====================================================================
"use client";

import { useState } from "react";
import { faqs } from "@/lib/constants";
import { FaqItem } from "@/components/ui/FaqItem";

export function FaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

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
          {faqs.map((faq, idx) => (
            <FaqItem
              key={idx}
              faq={faq}
              isOpen={openFaqIndex === idx}
              onToggle={() => toggleFaq(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
