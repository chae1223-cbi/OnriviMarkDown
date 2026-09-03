$filePath = "OMD_QUICK_TABLE.md"
$lines = Get-Content -Path $filePath -Encoding UTF8

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'OMD-EDIT-SettingsModal-0006') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — 환경설정 모달에 '계정 관리' 탭 신설: DB users 테이블의 회원 개인정보(이메일, 제공자, UUID, 가입일) 실시간 조회 및 AI 챗봇 연동 별명(활동명) 직접 수정/저장 기능 탑재; 좌측 하단 단일 [저장] 버튼 일원화 및 최신 Gemini 3.8 Flash 연동; **2026-07-16** — 단축키 설정 인풋 keydown 버블링 차단 및 PDF/인쇄 설정 모달 인터페이스 추가 "
            $lines[$i] = $parts -join '|'
        }
    }
}

Set-Content -Path $filePath -Value $lines -Encoding UTF8
Write-Output "OMD_QUICK_TABLE OMD-EDIT-SettingsModal-0006 updated successfully."
