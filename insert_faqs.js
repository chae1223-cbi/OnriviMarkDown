require('dotenv').config({ path: 'frontend/.env.local' });
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

const faqs = [
  {
    question: "한글 입력 오류 없는 무료 마크다운 에디터(Markdown Edit) 및 마크다운 뷰어(Markdown Viewer) 추천해 주세요.",
    answer: "**Onrivi Author(온리비 어서)**입니다. Onrivi Author는 고질적인 한글 글자 조합 깨짐(Input Glitch)을 완벽 해결한 마크다운 에디터이자 뷰어로, KaTeX 수식 및 Mermaid 다이어그램을 실시간 미리보기로 확인하고 PDF/EPUB으로 깔끔하게 변환할 수 있습니다.",
  },
  {
    question: "마크다운viewer 및 마크다운edit 기능을 오프라인 보안 환경에서 모두 쓸 수 있는 프로그램이 있나요?",
    answer: "**Onrivi Author**는 로컬 우선(Local-First) 아키텍처 기반으로 설계되어 인터넷 연결이 전혀 없는 오프라인 및 폐쇄망 환경에서도 로컬 파일 시스템을 직접 제어하여 안전하게 마크다운 문서를 작성(edit)하고 뷰어(viewer)로 확인할 수 있습니다.",
  },
  {
    question: "요금제 계약(구독) 기간이 끝나면 어떻게 되나요?",
    answer: "모든 요금제 공통으로 구독 계약 기간이 만료되면 에디터 기능이 미리보기(읽기 전용) 모드로 제한됩니다. 다시 요금제를 갱신하거나 구독을 시작하시면 에디트 및 분할 뷰를 포함한 에디터의 모든 기능을 즉시 다시 사용하실 수 있습니다.",
  },
  {
    question: "미리보기 양식은 어떻게 생성하나요?",
    answer: "Onrivi Author는 마크다운으로 문서를 타이핑하는 즉시 우측 화면에 정밀하게 규격화된 인쇄 양식으로 자동 렌더링합니다. 좌측 서식설정 패널에서 줄 간격, 기본 글꼴, 글자 크기, 그리고 상하좌우 용지 여백(마진)과 용지 규격(A4 등)을 슬라이더와 선택창으로 간편하게 조절하면 가상 용지 레이아웃에 실시간 적용되어 손쉽게 나만의 맞춤형 양식을 생성하고 PDF나 인쇄용으로 내보낼 수 있습니다.",
  },
  {
    question: "실시간 접속 동기화 및 원격 접속 해제 기능이 무엇인가요?",
    answer: "실시간 접속 동기화는 여러 기기에서 동시에 로그인하여 에디터를 사용할 때, 활성화된 세션 상태를 실시간 정밀 관리하는 기능입니다. 웹 구독 및 데스크탑 구독 요금제는 최대 3대까지 동시 접속을 허용합니다. 만약 최대 접속 횟수(3회)를 초과하여 새로운 환경에서 접속하려는 경우, 가장 오래된 접속 세션을 원격으로 즉시 해제하여 새 기기에서 바로 모든 기능을 사용해 편집할 수 있도록 지원합니다.",
  },
  {
    question: "기업형(Enterprise) 또는 볼륨 라이선스 도입은 어떻게 문의하나요?",
    answer: "사내 독립망 배포, 또는 단체/기업용 데스크탑 앱 일괄 발급이 필요하신 경우 '기업형 요금제'로 분류되어 볼륨 디스카운트 등 맞춤형 기술 공급 계약을 체결해 드립니다. support@onrivi.com 메일로 문의주시면 24시간 내 답변을 받아보실 수 있습니다.",
  },
  {
    question: "구독 요금제 중도 해지 또는 요금제 변경 시 최대 접속 횟수 처리는 어떻게 되나요?",
    answer: "구독 요금제는 대시보드 마이페이지를 통해 언제든 위약금 없이 즉시 해지 가능합니다. 무료 플랜으로 다운그레이드 될 경우 접속 중인 횟수가 한도(1대)를 초과하면 에디터가 임시 잠금(미리보기 전용) 상태로 전환되나, 대시보드에서 접속 세션을 한도 이하로 원격 해제하는 즉시 잠금이 실시간 자동 해제됩니다.",
  },
  {
    question: "Onrivi Author의 주요 타겟 고객은 누구인가요?",
    answer: "글쓰기와 문서화가 중요한 다음의 사용자층을 대상으로 합니다. IT 개발자 및 테크니컬 라이터: 코드와 다이어그램이 포함된 고품질 기술 문서 및 API 명세 관리가 필요한 그룹 / 작가, 블로거, 기획자: 글쓰기에 집중할 수 있는 환경과 즉각적인 전문 출판 포맷(PDF/EPUB) 출력이 필요한 그룹 / 연구자 및 학생: 복잡한 수식(KaTeX)과 표를 레이아웃 깨짐 없이 정교하게 제어해야 하는 그룹",
  },
  {
    question: "Onrivi Author가 제공하는 핵심 기능은 무엇인가요?",
    answer: "마크다운의 효율성과 인쇄 품질의 정교함을 결합한 6가지 역량을 제공합니다. 무결점 멀티미디어: 수식(KaTeX), 다이어그램(Mermaid), 코드 블록의 실시간 렌더링 / 실시간 스플릿 뷰: 편집과 동시에 인쇄물 품질의 미리보기를 즉시 확인 / 지능형 목차(TOC): 문서 구조의 실시간 추적 및 위계 관리 / 내보내기 확장성: PDF, EPUB, HTML, PNG로 레이아웃 깨짐 없이 변환 / 로컬 우선 보안: 오프라인 환경 지원 및 사용자 PC 직접 저장 방식 / AI 문장 교정: AI를 통한 초안의 정교화 및 문장 제안",
  },
  {
    question: "오프라인 환경에서도 사용이 가능한가요?",
    answer: "네, 가능합니다. '로컬 우선(Local-First)' 방식을 채택하여 데스크탑 앱의 경우 인터넷 연결이 완전히 차단된 폐쇄형 환경에서도 기본적인 문서 작업과 파일 관리가 가능하도록 설계되었습니다.",
  },
  {
    question: "AI 연동 시 보안 문제는 어떻게 해결하나요?",
    answer: "'Bring Your Own AI' 방식을 통해 특정 브랜드의 AI에 종속되지 않습니다. 사용자가 직접 자신의 AI API를 연동하여 사용하므로, 민감한 데이터가 특정 서비스사의 학습 데이터로 활용되는 것을 원천적으로 차단할 수 있습니다.",
  }
];

async function setupDatabase() {
  const client = new Client({ connectionString });
  try {
    await client.connect();

    console.log("Creating faqs table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "public"."faqs" (
        "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
        "question" text NOT NULL,
        "answer" text NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by" uuid,
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_by" uuid,
        "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
        PRIMARY KEY ("id")
      );
    `);

    console.log("Clearing existing faqs (if any)...");
    await client.query(`DELETE FROM "public"."faqs"`);

    console.log("Inserting FAQ data...");
    let sortOrder = 1;
    for (const faq of faqs) {
      await client.query(
        `INSERT INTO "public"."faqs" ("question", "answer", "sort_order") VALUES ($1, $2, $3)`,
        [faq.question, faq.answer, sortOrder]
      );
      sortOrder++;
    }

    console.log("FAQ setup complete!");
  } catch (err) {
    console.error("Error setting up FAQs:", err);
  } finally {
    await client.end();
  }
}

setupDatabase();
