// ====================================================================
// 📊 [OMD-CORE-docs-page-0001] page ➔ HelpCenterPage
// 🎯 @KICK  : 도움말 센터 화면 - 온리비 어서 소개, 마크다운 문법, 단축키, 세션 연동 해제 방법 안내
// 🛡️ @GUARD : React Server Component 구조로 고속 로딩
// 🚨 @PATCH : **2026-06-21** — 도움말 폴더 내의 실물 사용 설명서 및 상세 기능 명세서 내용을 심층 이식하여 전문 사용자 매뉴얼 페이지로 전면 개편 패치
// 🔗 @CALLS : Navbar, Footer
// ====================================================================
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  BookOpen, 
  Key, 
  Layers, 
  Cpu, 
  Image as ImageIcon, 
  HelpCircle, 
  FileText, 
  FileSpreadsheet, 
  ChevronRight,
  Code
} from "lucide-react";

export default function HelpCenterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 히어로 헤더 */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-100/50 dark:border-indigo-900/30">
              Onrivi Help Center
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mt-4 tracking-tight leading-tight">
              온리비 어서 사용 설명서
            </h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
              온리비 어서(Onrivi Author)의 마크다운 문법부터 미디어 삽입, 핵심 파싱 엔진 명세 및 트러블슈팅까지 상세 가이드를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* 좌측 고정 사이드바 네비게이션 */}
            <aside className="lg:col-span-1 hidden lg:block sticky top-28 self-start bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-xs">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">설명서 목차</h3>
              <nav className="flex flex-col gap-2.5 text-xs font-semibold">
                <a href="#intro" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  1. 온리비 어서란?
                </a>
                <a href="#markdown" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition">
                  <Layers className="w-3.5 h-3.5" />
                  2. 마크다운 문법 입문
                </a>
                <a href="#media" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition">
                  <ImageIcon className="w-3.5 h-3.5" />
                  3. 이미지 및 미디어 삽입
                </a>
                <a href="#features" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition">
                  <Cpu className="w-3.5 h-3.5" />
                  4. 핵심 렌더링 엔진 명세
                </a>
                <a href="#faq" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition">
                  <HelpCircle className="w-3.5 h-3.5" />
                  5. 트러블슈팅 및 FAQ
                </a>
                <a href="#sessions" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition">
                  <Key className="w-3.5 h-3.5" />
                  6. 동시접속 세션 관리
                </a>
              </nav>
            </aside>

            {/* 우측 본문 가이드 내용 */}
            <div className="lg:col-span-3 space-y-12">
              
              {/* 1. 소개 섹션 */}
              <section id="intro" className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">1. 온리비 어서란 무엇인가요?</h2>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  온리비 어서는 복잡한 서식 설정이나 정렬 붕괴 없이, 오직 텍스트 입력과 마크다운 문법에만 몰입하도록 개발된 전문 웹/데스크톱 에디터입니다. 대용량 문서를 쓸 때 발생하는 끝 글자 씹힘이나 밀림 현상을 원천 차단하고, 좌측의 <strong>CSS 서식 프로필</strong> 설정을 활용해 책 집필, 보고서, 연구 논문 등 출판물 수준의 문서를 번거로움 없이 완벽하게 인쇄 또는 PDF로 변환할 수 있습니다.
                </p>
              </section>

              {/* 2. 마크다운 문법 섹션 */}
              <section id="markdown" className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xs space-y-6 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 flex-shrink-0">
                    <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">2. 마크다운 문법 입문 가이드</h2>
                </div>
                <p className="text-xs md:text-sm text-gray-655 dark:text-gray-300 leading-relaxed">
                  마크다운을 사용하면 마우스 조작 없이 키보드 타이핑만으로 직관적으로 서식을 작성할 수 있습니다. 
                  주요 문법 규정은 다음과 같습니다.
                </p>
                
                <div className="space-y-6">
                  {/* 제목 */}
                  <div className="space-y-2">
                    <h4 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-150 flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                      제목 작성 (Headers)
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      문서의 구조를 설계할 때 <code>#</code> 기호를 사용하며, <code>#</code> 뒤에는 반드시 <strong>한 칸의 공백(Space)</strong>을 띄워야 정상적으로 우측 목차(TOC)와 동기화됩니다.
                    </p>
                    <pre className="bg-slate-50 dark:bg-gray-950/60 p-3 rounded-xl border border-gray-100 dark:border-gray-850 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      # 제목 1단계 (H1) - 문서/책의 제목<br />
                      ## 제목 2단계 (H2) - 대분류 / 장(Chapter)<br />
                      ### 제목 3단계 (H3) - 중분류 / 절(Section)
                    </pre>
                  </div>

                  {/* 목록 */}
                  <div className="space-y-2">
                    <h4 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-150 flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                      목록 및 리스트 (Lists)
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      순서 없는 글머리 기호(<code>-</code>, <code>*</code>) 혹은 순서 있는 번호 목록을 작성합니다. 작성 중 <code>Tab</code>을 누르면 계층을 들여쓰고, <code>Shift + Tab</code>을 누르면 내어씁니다.
                    </p>
                    <pre className="bg-slate-50 dark:bg-gray-950/60 p-3 rounded-xl border border-gray-100 dark:border-gray-850 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      - 첫 번째 항목<br />
                      &nbsp;&nbsp;- 세부 항목 (Tab 입력)<br />
                      1. 첫 번째 순서<br />
                      - [ ] 체크리스트 항목<br />
                      - [x] 완료한 항목
                    </pre>
                  </div>

                  {/* 표 내부 줄바꿈 팁 */}
                  <div className="space-y-2">
                    <h4 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-150 flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                      표(Table) 작성 및 표 내부 줄바꿈
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      수직선(<code>|</code>)과 하이픈(<code>-</code>)으로 정렬 기준을 조합해 표를 만듭니다. 표 내부에서 단순 <code>Enter</code>를 치면 규격이 완전히 깨지므로, 반드시 **<code>Shift + Enter</code>**를 눌러 줄바꿈 태그(<code>&lt;br&gt;</code>)를 자동 삽입하세요.
                    </p>
                    <pre className="bg-slate-50 dark:bg-gray-950/60 p-3 rounded-xl border border-gray-100 dark:border-gray-850 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      | 도서명 | 저자 | 출판일 |<br />
                      | :--- | :---: | ---: |<br />
                      | 온리비 저작도구 | 채병익 | 2026년 |<br />
                      | 표 셀 내부 줄바꿈 | Shift+Enter | &lt;br&gt; 자동주입 |
                    </pre>
                  </div>

                  {/* 지능형 각주 */}
                  <div className="space-y-2">
                    <h4 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-150 flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                      📌 지능형 각주(Footnote)
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      본문 편집 위치에서 툴바의 **각주(📌) 버튼**을 누르면 커서 자리에 각주 링크 앵커가 부여되며, 동시에 문서의 가장 마지막 줄에 각주 서술문 폼(<code>[^1]: </code>)이 자동 생성되고 포커스가 그곳으로 강제 이동됩니다.
                    </p>
                  </div>
                </div>
              </section>

              {/* 3. 이미지 및 미디어 삽입 가이드 */}
              <section id="media" className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xs space-y-6 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 flex-shrink-0">
                    <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">3. 이미지 및 미디어 삽입 가이드</h2>
                </div>
                <p className="text-xs md:text-sm text-gray-655 dark:text-gray-300 leading-relaxed">
                  온리비 어서는 안전하고 빠른 외부/로컬 리소스 스트리밍 미리보기를 통해 로컬 하드 디스크 상의 절대 경로 파일도 엑스박스 없이 온전히 렌더링합니다.
                </p>

                <div className="space-y-6 text-xs">
                  <div className="bg-slate-50 dark:bg-gray-950/60 p-4.5 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-3">
                    <span className="font-bold text-gray-900 dark:text-white block">로컬 절대 경로와 media:// 프로토콜</span>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-normal">
                      데스크톱 브라우저는 보안 샌드박스로 인해 하드디스크 로컬 파일 경로(<code>file:///C:/...</code>)에 바로 접근하는 것을 차단합니다. 
                      온리비 어서는 이를 우회하기 위해 내장 미디어 스트리밍 서버 핸들러를 탑재하여, 입력된 파일 경로를 가상의 <strong><code>media://</code> 특수 보안 프로토콜</strong>로 변환하여 CORS 에러 없이 선명하게 이미지를 띄워줍니다.
                    </p>
                    <code className="block bg-gray-100 dark:bg-gray-900 p-2 rounded text-indigo-600 dark:text-indigo-400 font-mono">
                      ![로컬 배너 사진](C:\Onrivi\Assets\banner.jpg)
                    </code>
                  </div>

                  <div className="bg-slate-50 dark:bg-gray-950/60 p-4.5 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-3">
                    <span className="font-bold text-gray-900 dark:text-white block">클립보드 이미지 즉시 붙여넣기 (Ctrl + V)</span>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-normal">
                      인터넷에서 캡처하거나 그래픽 도구에서 복사한 이미지를 번거롭게 파일로 저장해 둘 필요가 없습니다. 
                      원하는 에디터 위치에서 **<code>Ctrl + V</code>**를 입력하면 프로그램이 이미지 데이터를 인지하여 현재 마크다운 파일과 동일한 경로에 물리 이미지 파일(<code>image_시간값.png</code>)을 자동 저장하고, 마크다운 링크 문법을 즉시 완성해 줍니다.
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. 핵심 렌더링 엔진 명세 섹션 */}
              <section id="features" className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xs space-y-6 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 flex-shrink-0">
                    <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">4. 시스템 아키텍처 및 핵심 엔진 명세</h2>
                </div>
                <p className="text-xs md:text-sm text-gray-655 dark:text-gray-300 leading-relaxed">
                  온리비 어서는 Monaco 에디터 기반 비제어 구조와 실시간 파싱 캐시를 갖춘 고성능 렌더링 파이프라인으로 구동됩니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 dark:bg-gray-950/60 p-4.5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-indigo-500" />
                      <span className="font-bold text-gray-900 dark:text-white">Mermaid 다이어그램 안전 가드</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                      <li><strong>300ms 디바운스 렌더링</strong>: 타건 속도에 맞춰 끊임없이 컴파일을 시도하여 브라우저 스레드가 굳어버리는 렌더 락 현상을 완벽하게 방지합니다.</li>
                      <li><strong>parse 사전 검증 기술</strong>: <code>mermaid.parse()</code>를 통해 문법의 무결성을 실시간 검증한 뒤 렌더링하여 화면 뻗음을 차단합니다.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 dark:bg-gray-950/60 p-4.5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                    <div className="flex items-center gap-2 mb-2">
                      <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                      <span className="font-bold text-gray-900 dark:text-white">표(Table) 오피스 다중 복사 기능</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                      <li>표 영역 호버 시 활성화되는 복사 단추를 누르면, HTML 원문과 엑셀 친화적 탭 구분 텍스트(TSV)를 <strong>다중 클립보드 포맷</strong>으로 동시 적재합니다.</li>
                      <li>MS 워드, 엑셀, 한글(HWP) 등에 붙여 넣을 때 표 형태가 깨지지 않고 원형 그대로 보존되어 복사됩니다.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 5. 트러블슈팅 및 FAQ 섹션 */}
              <section id="faq" className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xs space-y-6 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">5. 트러블슈팅 및 자주 묻는 질문</h2>
                </div>

                <div className="space-y-6 divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="pt-0 space-y-2">
                    <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                      Q1. 창을 이동하거나 포커스를 유실할 때 마지막 한 글자가 씹히거나 중복됩니다.
                    </h4>
                    <p className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      한글의 자모가 결합되는 과정에서 브라우저 창 활성 상태가 변경되면 모나코 에디터 버퍼의 상태 정합성이 깨져 발생하는 브라우저 고유 결함입니다. 
                      온리비 어서는 <strong>포커스 유실 실시간 구출 알고리즘</strong>을 탑재하여, 창을 벗어나는 즉시 미완성 결합 텍스트를 강제로 본문 모델로 Flush 결합하여 유실 현상을 완벽히 방지합니다.
                    </p>
                  </div>

                  <div className="pt-6 space-y-2">
                    <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                      Q2. 자동완성 리스트에서 추천 단어를 고르고 Tab을 누르면 줄바꿈이나 공백이 깨집니다.
                    </h4>
                    <p className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      최신 패치를 통해 Tab 키의 가중치 조작 규칙이 일원화되었습니다. 
                      추천창이 팝업된 상태에서는 Tab 키가 단어 완성 수락으로 최우선 처리되며, 마크다운 목록(List) 행에 포커스가 있을 때는 리스트 들여쓰기 탭으로 안전하게 순차 적용됩니다.
                    </p>
                  </div>

                  <div className="pt-6 space-y-2">
                    <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                      Q3. 로컬 이미지를 불러왔는데 미리보기 창에 엑박(깨진 이미지)으로 뜹니다!
                    </h4>
                    <p className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      주소 경로에 기재된 이미지 파일이 컴퓨터 실제 경로가 맞는지 먼저 철저히 확인하세요. 
                      CORS 예방을 위해 프로그램 내부에 내장된 미디어 프록시 핸들러가 가상 <code>media://</code> 특수 스트리밍 변환을 가동해 줄 것입니다.
                    </p>
                  </div>
                </div>
              </section>

              {/* 6. 세션 동기화 섹션 */}
              <section id="sessions" className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 flex-shrink-0">
                    <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">6. 동시접속 세션 및 연동 원격 해제</h2>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  온리비 어서는 요금제 한도(예: 프로 6회, 프리미엄 9회) 내에서 복수의 브라우저나 디바이스를 자유롭게 연동해 실시간 편집 상태를 동기화할 수 있습니다. 접속 가능한 횟수가 가득 찬 상황에서 새로운 환경으로 로그인하는 경우, 에디터 화면이 미리보기(읽기 전용) 모드로 자동 전환됩니다. 이 경우 <strong>포털 대시보드(마이페이지) ➔ 동시접속 세션 관리</strong> 패널에서 사용하지 않는 기존 접속 세션을 클릭 한 번으로 원격 해제(접속 해제)하시면 즉시 새로운 기기에서 에디터의 모든 권한이 실시간 해제되어 정상 작동하게 됩니다.
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

