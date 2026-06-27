import re

with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'rb') as f:
    content = f.read().decode('utf-8')

original = content

# ── 1. msg.* import/선언 찾아서 확인 ──────────────────────────────────
print('=== msg.* 교체 시작 ===')

# ── 2. 개별 msg.* 교체 (showToast 호출로) ──────────────────────────────

replacements = [
    # Monaco 로더 오류
    (
        'msg.error("Monaco loader configuration error", err)',
        "showToast('에디터 로드 실패. 오프라인 모드로 안전 복구합니다.', 'warning')"
    ),
    # 백엔드 루트 조회 실패
    (
        "msg.warn('Backend root 조회 실패', err)",
        "showToast('백엔드 루트 경로 조회 실패.', 'warning')"
    ),
    # 워크스페이스 캐시 무효
    (
        'msg.warn("워크스페이스 캐시가 유효하지 않아 동작: 캐시를 초기화합니다.")',
        "showToast('워크스페이스 캐시가 유효하지 않아 초기화합니다.', 'warning')"
    ),
    # 디렉토리 목록 오류 (api.listDirectory)
    (
        'msg.error("파일 디렉토리 목록 오류", e)',
        "showToast('파일 목록을 불러오는 중 오류가 발생했습니다.', 'error')"
    ),
    # refreshFileList api 오류
    (
        'msg.error("refreshFileList api.listDirectory 오류", e)',
        "showToast('파일 목록 조회 실패. 잠시 후 다시 시도해 주세요.', 'error')"
    ),
    # Local file fetch 오류
    (
        'msg.error("Local file fetch error", err)',
        "showToast('파일 목록 조회 실패. 잠시 후 다시 시도해 주세요.', 'error')"
    ),
    # 워크스페이스 선택 오류
    (
        'msg.error("워크스페이스 선택 오류", err)',
        "showToast('워크스페이스 선택 중 오류가 발생했습니다.', 'error')"
    ),
    # 폴더 선택 오류
    (
        'msg.error("폴더 선택 오류", err)',
        "showToast('워크스페이스 선택 중 오류가 발생했습니다.', 'error')"
    ),
    # Save failed
    (
        'msg.error("Save failed", e)',
        "showToast('파일 저장 중 오류가 발생했습니다. 권한을 확인해 주세요.', 'error')"
    ),
    # HTML Table parsing
    (
        "msg.error('HTML Table parsing error', err)",
        "showToast('HTML 표 파싱 중 오류가 발생했습니다.', 'error')"
    ),
    # 클립보드 이미지 업로드
    (
        'msg.error("클립보드 이미지 업로드 실패", err)',
        "showToast('클립보드 이미지 업로드에 실패했습니다.', 'error')"
    ),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        print(f'  OK: {old[:50]!r}')
    else:
        print(f'  NOT FOUND: {old[:50]!r}')

# ── 3. msg.warn(`미매핑 커맨드 유입: ...`) 처리 (포맷 문자열) ──────────
pattern = re.compile(r"msg\.warn\(`미매핑 커맨드 유입: \$\{type\}`\)")
new_warn = "showToast(`알 수 없는 명령어: ${type}`, 'warning')"
content, n = pattern.subn(new_warn, content, count=1)
print(f'  msg.warn unmapped command: {n} replaced')

# ── 4. msg 객체 선언 제거 (있으면) ──────────────────────────────────────
# const msg = ... 같은 선언이 있으면 제거
# (실제로는 외부 모듈에서 import된 경우도 있으니 조심스럽게)
msg_remaining = list(re.finditer(r'msg\.(error|warn|log|info)', content))
print(f'\n남은 msg.* 호출: {len(msg_remaining)}개')
for m in msg_remaining:
    line = content[:m.start()].count('\n') + 1
    print(f'  L{line}: {m.group()!r}')

with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'wb') as f:
    f.write(content.encode('utf-8'))

print('\nDone!')
