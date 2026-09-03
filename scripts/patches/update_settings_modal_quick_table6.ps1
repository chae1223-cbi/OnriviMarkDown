$filePath = "OMD_QUICK_TABLE.md"
$lines = Get-Content -Path $filePath -Encoding UTF8

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'OMD-EDIT-SettingsModal-0006') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — 저장 버튼을 모달 좌측 하단 단일 [저장] 버튼으로 일원화(우측 중복 버튼 삭제); 좌측 저장 클릭 시 모든 설정/모델/API키 최종 반영 및 닫기 처리; AI 탭 연동 해제 버튼 신설 및 최신 Gemini 3.8 Flash 연동; **2026-07-16** — 단축키 설정 인풋 keydown 버블링 차단 및 PDF/인쇄 설정 모달 인터페이스 추가 "
            $lines[$i] = $parts -join '|'
        }
    }
}

Set-Content -Path $filePath -Value $lines -Encoding UTF8
Write-Output "OMD_QUICK_TABLE OMD-EDIT-SettingsModal-0006 updated successfully."
