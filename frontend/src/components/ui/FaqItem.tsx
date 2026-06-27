// ====================================================================
// 📊 [OMD-UI-FaqItem-0010] FaqItem ➔ FaqItem
// 🎯 @KICK  : 클릭 시 질문의 아코디언 접기/열기 인터랙션을 구현하는 FAQ 개별 항목 컴포넌트
// 🛡️ @GUARD : AnimatePresence 와 motion.div를 활용해 CSS 트랜지션 시 자연스러운 레이아웃 변화 보장
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 패치
// 🔗 @CALLS : framer-motion, lucide-react
// ====================================================================
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import type { FAQ } from "@/lib/constants";

interface FaqItemProps {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}

export function FaqItem({ faq, isOpen, onToggle }: FaqItemProps) {
  return (
    <div
      style={{
        border: "1px solid rgba(14,165,233,0.12)",
        borderRadius: "1rem",
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between transition-colors text-left"
        style={{
          background: "transparent",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#0f172a",
          }}
        >
          {faq.question}
        </span>
        {isOpen ? (
          <Minus className="w-5 h-5 text-sky-500 flex-shrink-0" />
        ) : (
          <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div
              className="px-6 pb-5 pt-0"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                color: "#3e4850",
                lineHeight: "22px",
                borderTop: "1px solid rgba(14,165,233,0.08)",
                paddingTop: 16,
              }}
            >
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
