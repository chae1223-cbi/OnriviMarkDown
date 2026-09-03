$filePath = "OMD_QUICK_TABLE.md"
$content = Get-Content -Path $filePath -Encoding UTF8
$newRow = "| OMD-UI-EditorPage-0001 ✅ FIXED | editor/page.tsx | Page | MainEditorApp을 SSR 비활성화 및 청크 로드 실패 시 자동 복구 가드를 통해 안전하게 마운트하는 최상위 에디터 진입 라우트 | Next.js 빌드/HMR 청크 불일치로 인한 ChunkLoadError 방어 및 1회 자동 새로고침 복구 가드 | **2026-09-03** — ChunkLoadError 자동 복구 리트라이 가드 추가 및 LDSG v5.0 로딩 스피너 UI 통일 | dynamic, MainEditorApp |"

# OMD-UI-DocumentGallerySection-0028 뒤에 삽입
$index = -1
for ($i = 0; $i -lt $content.Count; $i++) {
    if ($content[$i] -match "OMD-UI-DocumentGallerySection-0028") {
        $index = $i
        break
    }
}

if ($index -ge 0) {
    $newContent = @()
    for ($i = 0; $i -lt $content.Count; $i++) {
        $newContent += $content[$i]
        if ($i -eq $index) {
            $newContent += $newRow
        }
    }
    Set-Content -Path $filePath -Value $newContent -Encoding UTF8
    Write-Output "Added OMD-UI-EditorPage-0001 to OMD_QUICK_TABLE.md"
} else {
    Add-Content -Path $filePath -Value $newRow -Encoding UTF8
    Write-Output "Appended OMD-UI-EditorPage-0001 to OMD_QUICK_TABLE.md"
}
