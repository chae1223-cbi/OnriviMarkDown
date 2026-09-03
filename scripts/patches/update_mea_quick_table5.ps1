$filePath = "OMD_QUICK_TABLE.md"
$lines = Get-Content -Path $filePath -Encoding UTF8

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'OMD-EDIT-MainEditorApp-0001') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — 플로팅 AI 버튼 라벨을 사용자 별명 기반({별명} AI, 예: '탕수육 AI')으로 동적 변경 연동; 플로팅 챗봇에서 최종 선택한 모델의 onrivi_settings/localStorage 완벽 영구 동기화(재접속 시 최종 모델로 자동 시작); 에디터 초기 로드 시 미연결 챗봇 완전 숨김 가드 강화; 버튼 아이콘을 온리비 로고(/icon.png)로 변경하고 특별한 AI 오로라 바이올렛 그라데이션 컬러 적용; 웹 브레드크럼 실제 절대경로 상위 기준경로 설정 및 플로팅 AI 챗봇 분할 캡슐 버튼 구현; **2026-09-02** — 타이핑 시 180ms 지연 깜빡임을 완전히 제거하기 위해 React 18 useDeferredValue 기반 동시성 실시간 렌더링 적용 "
            $lines[$i] = $parts -join '|'
        }
    }
}

Set-Content -Path $filePath -Value $lines -Encoding UTF8
Write-Output "OMD_QUICK_TABLE OMD-EDIT-MainEditorApp-0001 updated successfully."
