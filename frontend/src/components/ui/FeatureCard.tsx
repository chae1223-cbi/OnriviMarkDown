// ====================================================================
// 📊 [OMD-UI-FeatureCard-0011] FeatureCard ➔ FeatureCard
// 🎯 @KICK  : 랜딩페이지 주요 기능 그리드에 배치되는 개별 피처 카드 컴포넌트
// 🛡️ @GUARD : motion.div의 viewport once 옵션을 통해 최초 1회만 애니메이션이 기동되도록 성능 최적화
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 패치
// 🔗 @CALLS : framer-motion
// ====================================================================
"use client";

import { motion } from "framer-motion";
import type { Feature } from "@/lib/constants";

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-8 rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1"
      style={{
        border: "1px solid rgba(14,165,233,0.12)",
      }}
    >
      <h3
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#006591",
          marginBottom: 12,
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: "#3e4850",
          lineHeight: "22px",
        }}
      >
        {feature.description}
      </p>
    </motion.div>
  );
}
