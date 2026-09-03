$filePath = "OMD_QUICK_TABLE.md"
$lines = Get-Content -Path $filePath -Encoding UTF8

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'OMD-EDIT-USEEDITORSETTINGS-0005') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — 환경설정에서 API 키 삭제 시 로컬스토리지 복구 단계에서 빈 문자열('')을 유효 상태로 인식하여 즉시 삭제 반영되도록 보완; **2026-06-20** — 다크모드 전면 비활성화 패치 "
            $lines[$i] = $parts -join '|'
        }
    }
}

Set-Content -Path $filePath -Value $lines -Encoding UTF8
Write-Output "OMD_QUICK_TABLE OMD-EDIT-USEEDITORSETTINGS-0005 updated successfully."
