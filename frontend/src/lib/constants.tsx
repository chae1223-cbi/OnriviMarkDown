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
}

export const features: Feature[] = [
  {
    icon: <PenLine className="w-6 h-6 text-indigo-500" />,
    title: "✍️ 끝 글자 씹힘 없는 완벽한 한글 타이핑",
    description: "대용량 문서를 집필할 때도 단 1ms의 밀림이나 한글 끝 글자 중복 버그 없이 물 흐르듯 매끄러운 타이핑을 보장합니다.",
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
    answer: "실시간 접속 동기화는 여러 브라우저나 기기에서 동시에 로그인하여 에디터를 사용할 때, 활성화된 세션 상태를 실시간으로 관리하는 기능입니다. 요금제별 최대 접속 횟수(3회, 6회, 9회)를 초과하여 새로운 환경에서 접속하려는 경우, 대시보드에서 기존 접속 세션을 원격으로 즉시 해제하여 새 접속 환경에서 바로 모든 기능을 사용해 편집할 수 있도록 지원합니다.",
  },
  {
    question: "기업형(Enterprise) 또는 볼륨 라이선스 도입은 어떻게 문의하나요?",
    answer: "사내 독립망 배포, 또는 단체/기업용 일괄 발급이 필요하신 경우 '기업형 요금제'로 분류되어 볼륨 디스카운트 등 맞춤형 기술 공급 계약을 체결해 드립니다. support@onrivi.com 메일로 문의주시면 24시간 내 답변을 받아보실 수 있습니다.",
  },
  {
    question: "구독 요금제 중도 해지 또는 요금제 변경 시 최대 접속 횟수 처리는 어떻게 되나요?",
    answer: "구독 요금제는 대시보드 마이페이지를 통해 언제든 위약금 없이 즉시 해지 가능합니다. 요금제 업그레이드 시에는 최대 접속 횟수가 즉시 증가하며, 다운그레이드 시 현재 접속 중인 횟수가 한도를 초과하면 에디터가 임시 잠금(미리보기 전용) 상태로 전환되나 대시보드에서 접속 세션을 한도 이하로 원격 해제하는 즉시 잠금이 실시간 자동 해제됩니다.",
  },
];

export const plans: Plan[] = [
  {
    name: "무료",
    tagline: "무료 체험판 (최대 접속 1회)",
    isFree: true,
    priceMonthly: 0,
    priceUSD: "0$",
    features: [
      "최대 접속 횟수 1회",
      "이용 기간 1주일 (7일)",
      "웹 및 데스크톱 모두 1주일 사용 가능",
    ],
    cta: "무료로 시작하기",
    ctaVariant: "secondary",
  },
  {
    name: "기본",
    tagline: "기본 요금제 (최대 접속 3회)",
    priceMonthly: 4500,
    priceUSD: "3$",
    features: [
      "최대 접속 횟수 3회",
    ],
    cta: "기본 플랜 구독",
    ctaVariant: "secondary",
  },
  {
    name: "프로",
    tagline: "프로 요금제 (최대 접속 6회)",
    highlighted: true,
    badge: "가장 인기",
    priceMonthly: 7500,
    priceUSD: "5$",
    features: [
      "최대 접속 횟수 6회",
    ],
    cta: "프로 플랜 구독",
    ctaVariant: "primary",
  },
  {
    name: "프리미엄",
    tagline: "프리미엄 요금제 (최대 접속 9회)",
    priceMonthly: 9900,
    priceUSD: "7$",
    features: [
      "최대 접속 횟수 9회",
    ],
    cta: "프리미엄 플랜 구독",
    ctaVariant: "secondary",
  },
];

export const NAV_LINKS = [
  { label: "기능 소개", href: "#features" },
  { label: "요금제", href: "#pricing" },
  { label: "자주 묻는 질문", href: "#faq" },
];

export const SITE_NAME = "Onrivi Author";
export const SITE_TAGLINE = "온리비(Onrivi)는 문서 본연의 가치와 완벽한 한글 타이핑 사용성을 지향합니다.";
