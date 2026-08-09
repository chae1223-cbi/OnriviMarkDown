// ====================================================================
// 📊 [OMD-UI-HeroSection-0022] HeroSection ➔ HeroSection
// 🎯 @KICK  : 첫인사 가치 제안 및 Onrivi Author 제품의 특장점 미리보기(원고 타건 샘플)를 보여주는 랜딩페이지 메인 히어로 영역
// 🛡️ @GUARD : Framer Motion 애니메이션 적용 및 Next.js Link 동작 가드
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식 및 /login 리다이렉트 변경 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (프리즘 배경, 글래스 프리뷰 카드, Ice Blue 그래디언트)
//             **2026-06-22** — 미리보기 카드를 원본 긴 버전(5가지 포인트 전체 + 스크롤)으로 복원 패치; 비로그인 상태 진입 유도 제거(무료로 시작하기 버튼 제거) 패치
// 🔗 @CALLS : motion.div, Link
// ====================================================================
"use client"; // "use client" : 클라이언트 사이드 렌더링을 위한 지시어    

import { motion } from "framer-motion"; // framer-motion : 애니메이션을 위한 라이브러리  
import Link from "next/link"; // Link : Next.js의 링크 컴포넌트  
import { BetaRegistrationForm } from "@/components/ui/BetaRegistrationForm";

export function HeroSection() { // HeroSection : 랜딩페이지의 히어로 섹션을 위한 컴포넌트  
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
          AI는 마크다운으로,{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #006591 0%, #0ea5e9 60%, #4ba5cc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            사람은 문서로
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="text-center mx-auto mb-10 max-w-2xl"
          style={{ fontSize: 18, fontWeight: 400, lineHeight: "28px", color: "#3e4850" }}
        >
          AI가 쏟아내는 기호와 코드가 섞인 복잡한 언어를 인간의 시각에 가장 최적화된 서식으로 재조판하여, 이 세상 모든 이들의 일상과 삶 속에서 온기가 흐르는 따뜻한 기록과 이야기로 피어나게 만듭니다.
        </motion.p>

        {/* Beta Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BetaRegistrationForm />
        </motion.div>

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
                ✨ 글쓰기가 10배가 되는 순간, Onrivi Author에 오신 것을 환영합니다! ✨
              </h1>
              <p style={{ marginBottom: 10, color: "#475569" }}>안녕하세요! Onrivi Author와 함께 창작의 기분 좋은 첫걸음을 내딛게 된 사용자 여러분을 진심으로 환영합니다! 🥰</p>
              <p style={{ marginBottom: 10, color: "#475569" }}>
                Onrivi Author는 글의 본질을 사랑하는 작가님, 매일 문서의 뼈대를 짓는 디자이너님, 그리고 나만의 지식을 성공적으로 자산화하고 싶은 개발자님을 위해 태어난{" "}
                <strong style={{ color: "#0f172a" }}>하이브리드 마크다운 지식 저작 시스템</strong>입니다. 그동안 메모장이나 일반 편집기를 쓰며 느끼셨던 소소한 렌더링 스트레스를 완벽히 해소해 드리고, 오직 글쓰기에만 몰입할 수 있는 명품 필기 환경을 선사합니다.
              </p>
              <p style={{ marginBottom: 10, color: "#475569" }}>
                &quot;마크다운이 뭐지? 문법이 어려우면 어쩌지?&quot; 걱정하지 마세요! Onrivi Author가 당신의 가장 다정한 창작 파트너가 되어, 딱딱한 기호들이 어떻게 아름다운 지면으로 사출되는지 직관적으로 증명해 드립니다. 🎈
              </p>
              <hr style={{ borderColor: "#e2e8f0", margin: "16px 0" }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                🌟 써본 사람만 감탄하는 Onrivi Author의 &apos;독보적 단짝 포인트 5가지&apos;
              </h2>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                1. 🎨 단순 텍스트를 넘어 시각 자료까지 완벽 도킹, &apos;무결점 멀티미디어 연결&apos;
              </h3>
              <p style={{ marginBottom: 14, color: "#475569" }}>
                Onrivi Author는 딱딱한 마크다운 기호 위에 이미지, YouTube 동영상, Google/Yandex 지도 등 다양한 시각 자료와 멀티미디어 자산을 실시간으로 매끄럽게 연결합니다. 클립보드 복사·붙여넣기만으로 로컬이나 웹상의 자산을 즉시 무결하게 임베드할 수 있으며, 다이어그램(Mermaid)과 전문 수식(KaTeX)까지 터치 한 번으로 완벽하게 녹여내어 가장 풍부하고 입체적인 지식 공간을 완성합니다.
              </p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                2. 🤝 AI와 빌드하고 세상과 공유하다, &apos;소통과 발행을 위한 단일 신뢰 소스(SSoT)&apos;
              </h3>
              <p style={{ marginBottom: 14, color: "#475569" }}>
                에디터 안에서 AI와 마크다운으로 초고속 소통하며 원고의 뼈대를 다듬고 정렬하지만, 글쓰기의 종착지는 결국 &apos;타인과의 완벽한 공유&apos;입니다. Onrivi Author는 기호가 섞인 딱딱한 AI의 언어를 사람이 읽는 가장 따뜻하고 정갈한 출판본 규격의 지면으로 실시간 조판해 내며, 완벽한 CSS 프로필이 주입된 PDF, HTML, EPUB, PNG 등의 프로페셔널 포맷으로 원클릭 사출하여 사용자 여러분의 생각을 세상에 가장 프로답게 공유하도록 돕습니다.
              </p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                3. 🖥️ 내 글이 어떻게 변하는지 실시간 확인하는 &apos;듀얼 스플릿 뷰&apos;
              </h3>
              <p style={{ marginBottom: 14, color: "#475569" }}>
                마크다운 기호를 타이핑하는 순간, 오른쪽 미리보기 창에 실제적인 아름다운 형식이 0.1초 만에 실시간으로 조판되어 나타납니다! 복잡한 문법 태그를 외우지 않아도 내 글이 어떻게 구조화되고 격상되고 있는지 눈으로 즉시 확인할 수 있으며, 오직 콘텐츠의 흐름에만 완전히 몰입할 수 있는 최적의 작업 시야를 제공합니다.
              </p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                4. 📂 내 컴퓨터의 구조가 그대로 연동되는 직결형 &apos;로컬 파일 탐색기&apos;
              </h3>
              <p style={{ marginBottom: 14, color: "#475569" }}>
                매번 문서를 가져오고 내보내는 번거로운 데이터베이스 배치 작업을 완전히 걷어냈습니다. 내 컴퓨터의 특정 작업 폴더를 지정하기만 하면, 하드디스크의 실제 폴더와 마크다운 파일 구조가 화면 왼쪽에 정갈한 트리 형태로 즉시 동기화됩니다. 마우스 클릭 한 번으로 무결하게 파일을 관리하는 정통 파일 매니징을 경험해 보세요.
              </p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#006591", marginBottom: 6 }}>
                5. 🗺️ 긴 호흡의 글도 길을 잃지 않는 &apos;실시간 문서 목차(TOC)&apos;
              </h3>
              <p style={{ marginBottom: 4, color: "#475569" }}>
                책 한 권 분량의 긴 글이나 방대한 기획서를 작성할 때, 내가 지금 어디쯤을 집필하고 있는지 헤매기 쉽습니다. Onrivi Author는 문서 내의 제목 표시(
                <code style={{ background: "rgba(14,165,233,0.08)", color: "#006591", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}>#</code>
                )를 정밀 추적하여 오른쪽에 실시간 내비게이션 목차(TOC)를 자동으로 빌드합니다. 목차의 제목을 클릭하는 즉시 해당 본문 위치로 고속 스크롤되어, 대용량 문서 작업의 효율이 압도적으로 늘어납니다.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
