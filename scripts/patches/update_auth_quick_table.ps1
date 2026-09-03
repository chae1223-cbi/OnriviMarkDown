$filePath = "OMD_QUICK_TABLE.md"
$lines = Get-Content -Path $filePath -Encoding UTF8

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'OMD-AUTH-login-page-0001') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — LDSG v5.0 디자인 시스템 및 웜 페이퍼 크림(#F9F8F6) 팔레트 전면 적용: 구형 인디고 룩/Material Symbols 제거, LINE Green(#06C755) 버튼 및 Lucide React 아이콘 교체; **2026-07-22** — 로그인 시 users 사전 검증 및 subscriptions 유효성 검증 적용 "
            $lines[$i] = $parts -join '|'
        }
    }
    elseif ($line -match 'OMD-AUTH-signup-page-0001') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — LDSG v5.0 디자인 시스템 및 웜 페이퍼 크림(#F9F8F6) 팔레트 전면 적용: 구형 인디고 룩/Material Symbols 제거, LINE Green(#06C755) 버튼, 실시간 유효성 체크 뱃지 및 Lucide React 아이콘 교체; **2026-07-22** — users 테이블 동기화 보강 "
            $lines[$i] = $parts -join '|'
        }
    }
    elseif ($line -match 'OMD-AUTH-forgot-password-0001') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — LDSG v5.0 디자인 시스템 및 웜 페이퍼 크림(#F9F8F6) 팔레트 전면 적용: 구형 인디고 룩/Material Symbols 제거, LINE Green(#06C755) 버튼 및 Lucide React 아이콘 교체; **2026-07-22** — 원트랜잭션 API 연동 "
            $lines[$i] = $parts -join '|'
        }
    }
    elseif ($line -match 'OMD-AUTH-reset-password-0001') {
        $parts = $line -split '\|'
        if ($parts.Count -ge 8) {
            $parts[6] = " **2026-09-03** — LDSG v5.0 디자인 시스템 및 웜 페이퍼 크림(#F9F8F6) 팔레트 전면 적용: 구형 인디고 룩/Material Symbols 제거, LINE Green(#06C755) 버튼, 실시간 유효성 체크 뱃지 및 Lucide React 아이콘 교체; **2026-07-22** — 원트랜잭션 API 연동 "
            $lines[$i] = $parts -join '|'
        }
    }
}

Set-Content -Path $filePath -Value $lines -Encoding UTF8
Write-Output "OMD_QUICK_TABLE auth rows updated successfully."
