$filePath = "OMD_QUICK_TABLE.md"
$lines = Get-Content -Path $filePath -Encoding UTF8

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'OMD-EDIT-SettingsModal-0006') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — 자원 관리(공통 자원 폴더)에 '전체사용자 필수 항목' 배지 및 미지정 시 강조 UI 적용; initialTab prop 지원을 통해 계정 관리 탭 다이렉트 전환 지원; 환경설정 모달 '계정 관리' 탭의 별명(활동명) 수정 시 [별명 저장] 및 좌측 하단 통합 [저장] 클릭 즉시 에디터 우측 하단 AI 챗봇 버튼명 및 DB users 테이블에 100% 실시간 영구 반영되도록 prop/이벤트/비동기 핸들러 전면 고도화; DB users 개인정보 실시간 조회 및 최신 Gemini 3.8 Flash 연동 "
            $lines[$i] = $parts -join '|'
        }
    }
    if ($line -match 'OMD-EDIT-MainEditorApp-0001') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — 전체사용자 대상 공통 리소스 폴더 미지정 시 초기 진입 가이드 모달(ResourceFolderGuideModal) 자동 연동 및 SELECT_RESOURCE_FOLDER 퀵 커맨드 신설; 플로팅 AI 버튼 라벨을 사용자 별명 기반({별명} AI, 예: '탕수육 AI')으로 동적 변경 연동; 플로팅 챗봇에서 최종 선택한 모델의 onrivi_settings/localStorage 완벽 영구 동기화(재접속 시 최종 모델로 자동 시작); 에디터 초기 로드 시 미연결 챗봇 완전 숨김 가드 강화 "
            $lines[$i] = $parts -join '|'
        }
    }
}

Set-Content -Path $filePath -Value $lines -Encoding UTF8
Write-Output "OMD_QUICK_TABLE updated successfully."
