$filePath = "OMD_QUICK_TABLE.md"
$lines = Get-Content -Path $filePath -Encoding UTF8

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'OMD-EDIT-MainEditorApp-0001') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — 웹 브레드크럼 실제 절대경로 상위 기준경로 설정 및 플로팅 AI 챗봇 분할 캡슐 버튼(연결된 AI/모델 실시간 표기 및 원클릭 모델 퀵 셀렉터 팝오버) 구현; **2026-09-02** — 타이핑 시 180ms 지연 깜빡임을 완전히 제거하기 위해 React 18 useDeferredValue 기반 동시성 실시간 렌더링 적용 "
            $lines[$i] = $parts -join '|'
        }
    }
}

Set-Content -Path $filePath -Value $lines -Encoding UTF8
Write-Output "OMD_QUICK_TABLE OMD-EDIT-MainEditorApp-0001 updated successfully."
