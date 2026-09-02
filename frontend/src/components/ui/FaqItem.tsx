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
      className="border border-outline/10 rounded-2xl overflow-hidden bg-surface-container shadow-xs text-on-surface"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between transition-colors text-left bg-transparent"
      >
        <span
          className="font-bold text-sm sm:text-base text-on-surface"
          style={{ fontFamily: "LineSeed, Pretendard, sans-serif" }}
        >
          {faq.question}
        </span>
        {isOpen ? (
          <Minus className="w-5 h-5 text-[#06C755] shrink-0" />
        ) : (
          <Plus className="w-5 h-5 text-text-secondary shrink-0" />
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
              className="px-6 pb-5 pt-3 text-sm text-text-secondary leading-relaxed border-t border-outline/10"
              style={{
                fontFamily: "LineSeed, Pretendard, sans-serif",
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
