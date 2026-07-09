// ====================================================================
// 📊 [OMD-CORE-constants-0001] constants.tsx ➔ constants
// 🎯 @KICK  : 랜딩페이지 및 요금제 뷰어에 활용되는 전역 정적 데이터 정의
// 🛡️ @GUARD : 무료 7일 1대, 3대 $3, 6대 $5, 9대 $7 요금 스펙 일치화
// 🚨 @PATCH : **2026-06-21** — OMDLanding 이식에 따른 피벗 요금제 및 FAQ 최종 데이터 갱신 패치; 무료체험판 제거 및 기업형 요금제 추가, 최대 접속 가능수 및 요금 만료 조건 갱신; 무료/기본/프로/프리미엄 요금제 분류 및 공통 혜택 별도 분리 패치; 다양한 양식 문서 작성 도입 및 합리적 요금제 특장점 문구 최신화 패치; 기기 대수 용어를 접속 횟수(최대 접속 횟수)로 용어 개편 패치; 데스크톱 프로그램 다운로드 섹션 제거에 따른 다운로드 네비게이션 링크 제거 패치; 데스크톱 FAQ를 미리보기 양식 생성 방법 FAQ로 대체 개편 패치
// 🔗 @CALLS : Lucide React icons
// ====================================================================
import {
  PenLine, Monitor, FileText, FolderTree, Map, CreditCard,
} from "lucide-react";
import type { ReactNode } from "react";

export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Plan {
  name: string;
  tagline: string;
  badge?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  ctaVariant: "primary" | "secondary";
  isFree?: boolean;
  isEnterprise?: boolean;
  priceMonthly?: number;
  priceYearly?: number;
  priceUSD?: string;
  addonMonthly?: number;
  addonYearly?: number;
  desktopMonthly?: number;
  desktopYearly?: number;
  environment: "web" | "desktop" | "both";
  tierEmoji: string;
}

export const features: Feature[] = [
  {
    icon: <Monitor className="w-6 h-6 text-indigo-500" />,
    title: "🎬 눈이 편안한 멀티미디어 문서 만들기",
    description: "유튜브 영상부터 지도까지, 당신이 보여주고 싶은 모든 시각 자료를 글 속에 매끄럽게 담아냅니다. 복잡한 컴퓨터 기호를 몰라도 누구나 프로처럼 멋진 문서를 완성할 수 있습니다.",
  },
  {
    icon: <Monitor className="w-6 h-6 text-indigo-500" />,
    title: "🖥️ 실시간 스플릿 뷰 렌더링",
    description: "마크다운 문법을 입력하는 즉시 오른쪽 화면에 출판물 수준의 아름다운 서식이 실시간으로 반영되어 문서 구조를 직관적으로 파악할 수 있습니다.",
  },
  {
    icon: <FileText className="w-6 h-6 text-indigo-500" />,
    title: "📝 다양한 양식의 문서 작성",
    description: "마크다운 기반의 작성으로 책 집필, 연구 보고서, 매뉴얼, 블로그 포스팅 등 다양한 포맷과 규격의 문서를 손쉽게 디자인하고 완성도 있게 출력할 수 있습니다.",
  },
  {
    icon: <FolderTree className="w-6 h-6 text-indigo-500" />,
    title: "📂 내 로컬 드라이브 폴더 구조 그대로 연동",
    description: "사용자가 선택한 로컬 작업 폴더 구조를 에디터 좌측에 트리 형태로 정갈하게 렌더링하여 자유롭게 문서를 읽고 쓸 수 있습니다.",
  },
  {
    icon: <Map className="w-6 h-6 text-indigo-500" />,
    title: "🗺️ 긴 원고의 길잡이가 되는 자동 목차(TOC)",
    description: "문서 내부의 제목(#) 수준을 실시간 추적하여 오른쪽 내비게이션 바에 정갈한 목차를 자동 빌드하며, 클릭 시 해당 위치로 즉시 스크롤 점프합니다.",
  },
  {
    icon: <CreditCard className="w-6 h-6 text-indigo-500" />,
    title: "💳 합리적인 요금제",
    description: "필요한 최대 접속 횟수에 맞춘 합리적인 가격 정책을 제공하여, 불필요한 비용 부담 없이 에디터의 모든 기능과 무제한 문서 작성 혜택을 온전히 누리실 수 있습니다.",
  },
];

export const faqs: FAQ[] = [
  {
    question: "요금제 계약(구독) 기간이 끝나면 어떻게 되나요?",
    answer: "모든 요금제 공통으로 구독 계약 기간이 만료되면 에디터 기능이 미리보기(읽기 전용) 모드로 제한됩니다. 다시 요금제를 갱신하거나 구독을 시작하시면 에디트 및 분할 뷰를 포함한 에디터의 모든 기능을 즉시 다시 사용하실 수 있습니다.",
  },
  {
    question: "미리보기 양식은 어떻게 생성하나요?",
    answer: "온리비 어서는 마크다운으로 문서를 타이핑하는 즉시 우측 화면에 정밀하게 규격화된 인쇄 양식으로 자동 렌더링합니다. 좌측 서식설정 패널에서 줄 간격, 기본 글꼴, 글자 크기, 그리고 상하좌우 용지 여백(마진)과 용지 규격(A4 등)을 슬라이더와 선택창으로 간편하게 조절하면 가상 용지 레이아웃에 실시간 적용되어 손쉽게 나만의 맞춤형 양식을 생성하고 PDF나 인쇄용으로 내보낼 수 있습니다.",
  },
  {
    question: "실시간 접속 동기화 및 원격 접속 해제 기능이 무엇인가요?",
    answer: "실시간 접속 동기화는 여러 기기에서 동시에 로그인하여 에디터를 사용할 때, 활성화된 세션 상태를 실시간으로 관리하는 기능입니다. 웹 구독 및 데스크탑 구독 요금제는 최대 3대까지 동시 접속을 허용합니다. 만약 최대 접속 횟수(3회)를 초과하여 새로운 환경에서 접속하려는 경우, 대시보드에서 기존 접속 세션을 원격으로 즉시 해제하여 새 기기에서 바로 모든 기능을 사용해 편집할 수 있도록 지원합니다.",
  },
  {
    question: "기업형(Enterprise) 또는 볼륨 라이선스 도입은 어떻게 문의하나요?",
    answer: "사내 독립망 배포, 또는 단체/기업용 데스크탑 앱 일괄 발급이 필요하신 경우 '기업형 요금제'로 분류되어 볼륨 디스카운트 등 맞춤형 기술 공급 계약을 체결해 드립니다. support@onrivi.com 메일로 문의주시면 24시간 내 답변을 받아보실 수 있습니다.",
  },
  {
    question: "구독 요금제 중도 해지 또는 요금제 변경 시 최대 접속 횟수 처리는 어떻게 되나요?",
    answer: "구독 요금제는 대시보드 마이페이지를 통해 언제든 위약금 없이 즉시 해지 가능합니다. 무료 플랜으로 다운그레이드 될 경우 접속 중인 횟수가 한도(1대)를 초과하면 에디터가 임시 잠금(미리보기 전용) 상태로 전환되나, 대시보드에서 접속 세션을 한도 이하로 원격 해제하는 즉시 잠금이 실시간 자동 해제됩니다.",
  },
];

export const plans: Plan[] = [
  {
    name: "Reader",
    tagline: "평생 무료 읽기 전용",
    badge: "🥉",
    isFree: true,
    environment: "web",
    tierEmoji: "🥉",
    features: [
      "회원가입 시 세상의 모든 마크다운 문서를 제한 없이 자유롭게 읽기 가능",
    ],
    cta: "무료 회원가입",
    ctaVariant: "secondary",
  },
  {
    name: "Apprentice",
    tagline: "7일 무료 체험",
    badge: "🥈",
    isFree: true,
    environment: "web",
    tierEmoji: "🥈",
    features: [
      "가입 후 7일 동안 모든 문서 읽기 + 편집 기능 무료 체험",
      "편집(Write): 단 1개의 브라우저에서만 작성 가능",
      "웹 뷰어: 모든 마크다운 문서를 브라우저로 원클릭 공유!",
    ],
    cta: "무료 체험 시작",
    ctaVariant: "secondary",
  },
  {
    name: "Regular",
    tagline: "월 3,000원 / 연 30,000원",
    badge: "🥇",
    highlighted: true,
    environment: "web",
    tierEmoji: "🥇",
    priceMonthly: 3000,
    priceYearly: 30000,
    priceUSD: "$2",
    features: [
      "매달 가볍게 시작하는 월간 구독 또는 합리적인 연간 구독 선택",
      "편집(Write): 1개의 브라우저에서만 문서 편집 가능",
      "웹 뷰어: 모든 마크다운 문서를 브라우저로 원클릭 공유!",
    ],
    cta: "구독 시작",
    ctaVariant: "primary",
  },
  {
    name: "Elite Pro",
    tagline: "오프라인 + 웹 듀얼 환경",
    badge: "💎",
    environment: "desktop",
    tierEmoji: "💎",
    priceYearly: 45000,
    priceUSD: "$30",
    features: [
      "내 컴퓨터에 직접 설치하는 독립 설치형 프로그램 제공",
      "설치 권한: 단 1대 PC 설치 및 고유 인증",
      "설치한 PC에서 무제한 읽기/편집 가능",
      "웹 뷰어: 모든 마크다운 문서를 브라우저로 원클릭 공유!",
    ],
    cta: "Elite Pro 구독",
    ctaVariant: "primary",
  },
];

export const NAV_LINKS = [
  { label: "기능 소개", href: "#features" },
  { label: "요금제", href: "#pricing" },
  { label: "자주 묻는 질문", href: "#faq" },
];

export const SITE_NAME = "Onrivi Author";
export const SITE_TAGLINE = "온리비(Onrivi)는 문서 본연의 가치와 완벽한 한글 타이핑 사용성을 지향합니다.";

