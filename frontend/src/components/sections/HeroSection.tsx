// ====================================================================
// 📊 [OMD-UI-HeroSection-0022] HeroSection ➔ HeroSection
// 🎯 @KICK  : 첫인사 가치 제안 및 온리비 어서 제품의 특장점 미리보기(원고 타건 샘플)를 보여주는 랜딩페이지 메인 히어로 영역
// 🛡️ @GUARD : Framer Motion 애니메이션 적용 및 Next.js Link 동작 가드
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식 및 /login 리다이렉트 변경 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (프리즘 배경, 글래스 프리뷰 카드, Ice Blue 그래디언트)
//             **2026-06-22** — 미리보기 카드를 원본 긴 버전(5가지 포인트 전체 + 스크롤)으로 복원 패치; 비로그인 상태 진입 유도 제거(무료로 시작하기 버튼 제거) 패치
// 🔗 @CALLS : motion.div, Link
// ====================================================================
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="pt-32 pb-24 sm:pt-44 sm:pb-32 overflow-hidden relative"
      style={{ fontFamily: "Inter, sans-serif", background: "#f7f9fb" }}
    >
      {/* Decorative background orbs */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: "-10%", left: "60%",
          width: 480, height: 480,
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute", bottom: "5%", left: "-5%",
          width: 320, height: 320,
          background: "radial-gradient(circle, rgba(75,165,204,0.10) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        }}
      />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative" style={{ zIndex: 1 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-8"
        >
          <span className="chip">✦ 프리미엄 마크다운 에디터</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-center mb-6"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#0f172a",
          }}
        >
          초안은 마크다운으로 가볍게,{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #006591 0%, #0ea5e9 60%, #4ba5cc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            발행은 인쇄본 수준으로 완벽하게.
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="text-center mx-auto mb-16 max-w-2xl"
          style={{ fontSize: 18, fontWeight: 400, lineHeight: "28px", color: "#3e4850" }}
        >
          복잡한 서식 설정 없이 텍스트만 치세요. 레이아웃 붕괴 없는 온리비 어서만의 독점적 CSS 프로필 명세서가
          당신의 글을 프로의 문정(Document)으로 격상시킵니다.
        </motion.p>

        {/* Editor Preview Card — 원본 긴 버전 복원 (스크롤 포함) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.5)",
            borderRadius: "1.5rem",
            boxShadow: "0 24px 48px rgba(14,165,233,0.10), 0 2px 8px rgba(0,0,0,0.04)",
            padding: 6,
            overflow: "hidden",
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              background: "rgba(247,249,251,0.95)",
              borderBottom: "1px solid rgba(14,165,233,0.10)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderRadius: "calc(1.5rem - 6px) calc(1.5rem - 6px) 0 0",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fca5a5", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fcd34d", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
            <span style={{ marginLeft: 12, fontSize: 12, color: "#6e7881", fontFamily: "monospace" }}>onrivi-author_preview.md</span>
          </div>

          {/* Scrollable content — 원본 복원 */}
          <div
            style={{
              maxHeight: 560,
              overflowY: "auto",
              background: "rgba(255,255,255,0.9)",
              borderRadius: "0 0 calc(1.5rem - 6px) calc(1.5rem - 6px)",
            }}
          >
            <div style={{ padding: "24px 32px", textAlign: "left", fontSize: 14, lineHeight: "24px", color: "#1e293b", fontFamily: "Inter, sans-serif" }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                ✨ 글쓰기가 10배 즐거워지는 마법! 온리비 어서(Onrivi Author)에 오신 것을 환영합니다! ✨
              </h1>
              <p style={{ marginBottom: 10, color: "#475569" }}>안녕하세요! 온리비 어서와 함께 기분 좋은 첫걸음을 내딛게 된 것을 진심으로 환영합니다! 🥰</p>
              <p style={{ marginBottom: 10, color: "#475569" }}>
                온리비 어서는 글을 사랑하는 작가님, 매일 문서와 씨름하는 기획자님, 그리고 나만의 지식을 멋지게 기록하고 싶은 개발자님을 위해 태어난{" "}
                <strong style={{ color: "#0f172a" }}>문서 편집기</strong>예요. 기존 메모장이나 워드 프로그램을 쓰면서 느꼈던 소소한 스트레스들을 싹 해결해 드리기 위해 정성껏 빚어냈답니다.
              </p>
              <p style={{ marginBottom: 10, color: "#475569" }}>
                &quot;마크다운이 뭐지? 어려우면 어쩌지?&quot; 걱정하지 마세요! 온리비 어서가 얼마나 쉽고 다정한 친구인지, 지금부터 알기 쉽게 소개해 드릴게요. 🎈
              </p>
              <hr style={{ borderColor: "#e2e8f0", margin: "16px 0" }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                🌟 써본 사람만 감탄하는 온리비 어서의 &apos;단짝 포인트 5가지&apos;
              </h2>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                1. 🔒 인터넷이 끊겨도 안심! 내 소중한 원고를 지켜요
              </h3>
              <p style={{ marginBottom: 14, color: "#475569" }}>
                온리비 어서는 무겁고 불안한 외부 서버를 거치지 않고,{" "}
                <strong style={{ color: "#0f172a" }}>인터넷이 전혀 안 되는 비행기 안이나 공공기관 폐쇄망에서도 0.X초 만에 번개처럼 켜져요!</strong>{" "}
                모든 글이 내 컴퓨터(로컬 하드디스크)에만 안전하게 보관되니까, 해킹이나 원고 날아갈 걱정 없이 오직 글쓰기에만 푹 몰입하실 수 있답니다. 🛡️
              </p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                2. ✍️ 한글 타이핑이 정말 찰지게 잘 쳐져요!
              </h3>
              <p style={{ marginBottom: 14, color: "#475569" }}>
                기존의 흔한 에디터들은 한글을 치다 보면 끝 글자가 씹히거나 중복으로 적히는 버그가 많아 속상하셨죠? 온리비 어서는 고성능 에디팅 엔진을 탑재해서,{" "}
                <strong style={{ color: "#0f172a" }}>대용량 문서를 쓸 때도 글자가 밀리는 느낌 없이 물 흐르듯 매끄러운 손맛</strong>을 자랑해요!
              </p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                3. 🖥️ 내 글이 어떻게 변하는지 실시간으로 보는 &apos;듀얼 스플릿 뷰&apos;
              </h3>
              <p style={{ marginBottom: 14, color: "#475569" }}>
                마크다운 기호를 타이핑하는 순간, 우측 미리보기 창에{" "}
                <strong style={{ color: "#0f172a" }}>실제 출판물 수준의 아름다운 서식이 0.1초 만에 실시간으로 렌더링</strong>되어 나타나요! 복잡한 문법을 외우지 않아도 내 글이 어떻게 구조화되고 있는지 눈으로 즉시 확인하며 오직 원고 집필에만 즐겁게 몰입할 수 있답니다.
              </p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                4. 📂 폴더 구조 그대로! 가볍고 직관적인 &apos;로컬 파일 탐색기&apos;
              </h3>
              <p style={{ marginBottom: 14, color: "#475569" }}>
                따로 복잡한 데이터베이스를 구축하지 않아도, 내 컴퓨터의 특정 폴더를 지정하기만 하면{" "}
                <strong style={{ color: "#0f172a" }}>하드디스크의 폴더와 마크다운 파일 구조를 화면 왼쪽에 정갈한 트리 형태로 쏙 띄워줘요!</strong>{" "}
                마우스 클릭 한 번으로 수십 개의 문서를 자유롭게 오가며 관리할 수 있는 가장 클래식하고 강력한 파일 매니징을 경험해 보세요.
              </p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                5. 🗺️ 긴 글도 한눈에 파악하는 &apos;실시간 문서 목차(TOC)&apos;
              </h3>
              <p style={{ marginBottom: 4, color: "#475569" }}>
                책 한 권 분량의 긴 글이나 보고서를 쓸 때 내가 지금 어디쯤 쓰고 있는지 길을 잃기 십상이죠? 온리비 어서가 문서 내의 제목 기호(
                <code style={{ background: "rgba(14,165,233,0.08)", color: "#006591", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}>#</code>
                )를 실시간으로 추적하여{" "}
                <strong style={{ color: "#0f172a" }}>오른쪽에 정갈한 탐색 목차(Table of Contents)를 자동으로 빌드</strong>해 줍니다. 목차의 제목을 누르면 해당 본문 위치로 즉시 스크롤되어 긴 문서 작업이 대단히 쾌적해집니다.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
