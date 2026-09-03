$filePath = "OMD_QUICK_TABLE.md"
$lines = Get-Content -Path $filePath -Encoding UTF8

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'OMD-EDIT-MenuBar-0004') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — 상단 우측 사용자 정보 표시줄을 이메일 대신 별명(userNickname)으로 우선 표기 및 클릭 시 환경설정 '계정 관리' 탭(SETTINGS_ACCOUNT)으로 즉각 이동 연동; 환경설정에서 별명 변경 시 실시간 동기화 리스너 탑재; **2026-09-02** — [ONRIVI-DS-SYSTEM-002 v5.0] LINE Design System (LDSG) 표준 적용 "
            $lines[$i] = $parts -join '|'
        }
    }
}

Set-Content -Path $filePath -Value $lines -Encoding UTF8
Write-Output "OMD_QUICK_TABLE OMD-EDIT-MenuBar-0004 updated successfully."
