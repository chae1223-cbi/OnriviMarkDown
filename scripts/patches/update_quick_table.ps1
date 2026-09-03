$filePath = "OMD_QUICK_TABLE.md"
$lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8)

$heroRow = "| OMD-UI-HeroSection-0022 ✅ FIXED | HeroSection.tsx | HeroSection | Onrivi Author Premium V2 타이포그래피 가치 제안 및 제품 실제 UI(에디터 타건 + AI 어시스트 + 출판급 문서 뷰)를 전면에 선보이는 핵심 히어로 영역 | Framer Motion 모션 버벅임 억제 및 반응형 뷰포트 레이아웃 가드 | **2026-09-03** — Onrivi Author Premium V2 개편: 대형 타이포그래피(font-size clamp 44~76px) 및 실제 에디터/문서 분할 뷰 일체형 목업 탑재, LINE Green(#06C755) 단일 악센트 적용; **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 | motion.div, Link |"
$pricingRow = "| OMD-UI-PricingSection-0023 ✅ FIXED | PricingSection.tsx | PricingSection | Onrivi Author 서비스 멤버십 가격표 컴포넌트 | DB plans 데이터 동적 fetch 및 정규화 | **2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: 초록색 풀 채움 카드 제거, White/Surface 베이스에 Regular 플랜 얇은 Green 테두리 및 MOST POPULAR 뱃지/elevation 고급화 적용; **2026-08-07** — DB pricing_plans 동적 마이그레이션 | fetch, ConfirmModal |"
$ctaRow = "| OMD-UI-CtaSection-0025 ✅ FIXED | CtaSection.tsx | CtaSection | 사용자 가입 전환(CTA)을 강력하게 소구하고 회원가입 경로로 리다이렉트하는 랜딩페이지 마지막 전환 유도 영역 | viewport once 옵션을 활성화하여 모션 버벅임 억제 | **2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: 둥근 카드 박스를 걷어내고 전체 폭 활용 + 은은한 Green Glow 배경의 모던 와이드 CTA 탑재; **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 | Link, motion.div |"
$faqRow = "| OMD-UI-FaqSection-0024 ✅ FIXED | FaqSection.tsx | FaqSection | 자주 묻는 질문(FAQ) 목록을 바인딩하고 아코디언 컴포넌트를 호출하여 상태를 매핑하는 섹션 | openFaqIndex 상태를 통해 오직 하나의 질문만 열릴 수 있도록 토글 제어 | **2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: 집중도 높은 760px 너비 아코디언 및 LDSG v5.0 고대비 타이포그래피/그린 포인트 적용; **2026-08-07** — DB API('/api/faqs') 동적 렌더링 마이그레이션 | FaqItem |"

$newRows = @(
    "| OMD-UI-PhilosophySection-0026 ✅ FIXED | PhilosophySection.tsx | PhilosophySection | '생각은 Markdown으로, 사람은 문서로' 설계 철학 시각화 및 파이프라인 개념도 제공 | 반응형 플로우 단계 렌더링 및 모바일 가독성 가드 | **2026-09-03** — Onrivi Author Premium V2 신규 생성: HOW IT WORKS 및 생각-AI-구조화-문서 파이프라인 시각화 | motion.div, Lucide icons |",
    "| OMD-UI-ExperienceSection-0027 ✅ FIXED | ExperienceSection.tsx | ExperienceSection | 3대 핵심 경험(WRITE, REFINE, PUBLISH)을 실제 제품 UI 목업과 함께 단계별로 몰입감 있게 선보이는 피처 섹션 | 탭 상태 스위칭 및 반응형 카드 UI 오버플로우 방지 | **2026-09-03** — Onrivi Author Premium V2 신규 생성: 기존 6개 분절 카드 제거 및 WRITE/REFINE/PUBLISH 3단계 제품 스토리텔링 뷰 구축 | motion.div, AnimatePresence |",
    "| OMD-UI-DocumentGallerySection-0028 ✅ FIXED | DocumentGallerySection.tsx | DocumentGallerySection | 실무 4대 핵심 문서(기획서, 기능명세서, 회의록, 기술문서)를 실제 조판된 문서 카드로 쇼케이스하는 갤러리 섹션 | 문서 카드 그리드 반응형 가드 및 호버 인터랙션 보장 | **2026-09-03** — Onrivi Author Premium V2 신규 생성: '문서가 곧 비주얼이 된다'는 기획 철학을 구현한 Documents Gallery 컴포넌트 탑재 | motion.div, Lucide icons |"
)

$outList = [System.Collections.Generic.List[string]]::new()
$hasAppendedNew = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -like "*OMD-UI-HeroSection-0022*") {
        $outList.Add($heroRow)
    } elseif ($line -like "*OMD-UI-PricingSection-0023*") {
        $outList.Add($pricingRow)
    } elseif ($line -like "*OMD-UI-CtaSection-0025*") {
        $outList.Add($ctaRow)
        if (-not $hasAppendedNew) {
            foreach ($nr in $newRows) {
                $outList.Add($nr)
            }
            $hasAppendedNew = $true
        }
    } elseif ($line -like "*OMD-UI-FaqSection-0024*") {
        $outList.Add($faqRow)
    } else {
        $outList.Add($line)
    }
}

[System.IO.File]::WriteAllLines($filePath, $outList.ToArray(), [System.Text.Encoding]::UTF8)
Write-Host "Updated OMD_QUICK_TABLE.md successfully."
