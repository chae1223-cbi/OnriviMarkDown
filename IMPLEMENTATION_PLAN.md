# RPC Stored Procedure 전환 구현 계획서

## 목표

모든 Supabase DML을 SECURITY DEFINER Stored Procedure(RPC)로 전환하여 RLS를 우회하고, 각 단계별 오류를 JSONB로 반환하여 프론트엔드에서 일관된 에러 처리 가능하게 함.

---

## 1. 아키텍처

### RPC 응답 JSONB 표준 형식

```jsonc
// 성공
{ "success": true, "code": "OK", "step": "단계명", "message": "..." }

// 실패 (비즈니스 로직)
{ "success": false, "code": "ERR_원인", "step": "단계명", "message": "사용자 친화적 메시지" }

// 실패 (시스템 오류)
{ "success": false, "code": "ERR_INSERT_FAILED", "step": "단계명", "message": "DB 오류: SQLERRM" }
```

### 프론트엔드 호출 패턴

```typescript
const { data: result, error: rpcError } = await supabase.rpc('함수명', { ...params });

if (rpcError) {
  // RPC 호출 자체 실패 (404, network 등)
  showToast('오류: ' + rpcError.message, 'error');
} else if (result && !result.success) {
  // 비즈니스 로직 실패 (RPC가 반환한 에러)
  showToast(result.message, 'error');
} else if (result && result.success) {
  // 성공
  console.log('[OK]', result.message);
}
```

---

## 2. RPC 목록 (총 10개)

### 완료 (2)
| 함수 | 파일 | 상태 |
|------|------|------|
| `insert_license_activation` | (SQL + MainEditorApp/login/auth/callback) | ✅ |
| `register_user` | (SQL + signup) | ✅ |

### Phase 1 — 폴링/세션체크 (1)
| # | 함수 | 설명 |
|---|------|------|
| 1 | `check_license_session` | payment_no + device_uuid로 세션 존재여부 + 접속자수 반환 |

### Phase 2 — 로그아웃/종료 (2)
| # | 함수 | 설명 |
|---|------|------|
| 2 | `delete_license_activation` | editor EXIT 시 단일 세션 제거 |
| 3 | `deactivate_session_on_logout` | 로그아웃 시 세션 제거 (Navbar/dashboard) |

### Phase 3 — 라이선스/기기관리 (2)
| # | 함수 | 설명 |
|---|------|------|
| 4 | `upsert_license_activation` | LicenseModal 데스크탑 라이선스 등록 |
| 5 | `delete_device_activation` | 대시보드 기기强제 해제 |

### Phase 4 — 사용자/구독 (2)
| # | 함수 | 설명 |
|---|------|------|
| 6 | `upsert_user` | users 테이블 동기화 |
| 7 | `subscribe_user_plan` | 플랜 선택 → subscription + license + activation 트랜잭션 일괄처리 |

### 보류 (1)
| # | 함수 | 설명 |
|---|------|------|
| 8 | `change_plan` | 현재 호출하는 곳 없음, 필요시 구현 |

---

## 3. 각 RPC 상세 설계

### Phase 1-1: `check_license_session`

```sql
CREATE FUNCTION check_license_session(
  p_payment_no TEXT,
  p_device_uuid TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
```

**검증 단계:**
1. 입력값 검증 (payment_no, device_uuid)
2. `software_licenses` 조회 (payment_no)
3. `license_activations` 존재여부 확인
4. 5분 기준 활성 세션 카운트
5. `subscriptions.max_devices` 조회

**반환:**
```jsonc
// 성공
{ "success": true, "code": "OK", "has_session": true, "active_count": 3, "max_devices": 5 }
// 실패
{ "success": false, "code": "ERR_LICENSE_NOT_FOUND", "message": "..." }
```

**호출 위치 교체:**
- `MainEditorApp.tsx` lines 1049-1066 (checkActivation 폴링)
- `MainEditorApp.tsx` lines 943-954 (접속자수 초과 체크)

---

### Phase 2-1: `delete_license_activation`

```sql
CREATE FUNCTION delete_license_activation(
  p_license_id UUID,
  p_device_uuid TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
```

**검증 단계:**
1. 입력값 검증
2. 존재하는 activation인지 확인
3. DELETE 실행

**호출 위치:** `useEditorHandlers.ts:623` — editor `exit` 액션

---

### Phase 2-2: `deactivate_session_on_logout`

```sql
CREATE FUNCTION deactivate_session_on_logout(
  p_license_id UUID,
  p_device_uuid TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
```

**검증 단계:**
1. 입력값 검증
2. 존재하는 activation인지 확인
3. DELETE 실행

**호출 위치:**
- `Navbar.tsx:59` — 로그아웃 버튼
- `dashboard/page.tsx:180` — 대시보드 로그아웃

---

### Phase 3-1: `upsert_license_activation`

```sql
CREATE FUNCTION upsert_license_activation(
  p_license_id UUID,
  p_device_uuid TEXT,
  p_device_name TEXT DEFAULT 'MyPC'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
```

**검증 단계:**
1. 입력값 검증
2. 라이선스 존재 확인
3. 기기 중복 확인 (다른 license_id에 같은 device_uuid가 있는지)
4. INSERT ON CONFLICT UPSERT

**호출 위치:** `LicenseModal.tsx:212`

---

### Phase 3-2: `delete_device_activation`

```sql
CREATE FUNCTION delete_device_activation(
  p_activation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
```

**검증 단계:**
1. 입력값 검증
2. activation 존재 확인
3. DELETE 실행

**호출 위치:** `dashboard/page.tsx:196`
**참고:** 현재 `o_error_message` 패턴 사용 중 → JSONB로 변경

---

### Phase 4-1: `upsert_user`

```sql
CREATE FUNCTION upsert_user(
  p_id UUID,
  p_email TEXT,
  p_provider TEXT DEFAULT 'email'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
```

**검증 단계:**
1. 입력값 검증
2. INSERT ON CONFLICT (id) DO UPDATE

**호출 위치:** `dashboard/page.tsx:99`

---

### Phase 4-2: `subscribe_user_plan`

```sql
CREATE FUNCTION subscribe_user_plan(
  p_user_id UUID,
  p_plan_name TEXT,
  p_plan_status TEXT,
  p_billing_interval TEXT,
  p_max_devices INT,
  p_period_end TIMESTAMPTZ,
  p_today_str TEXT,
  p_device_uuid TEXT,
  p_device_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
```

**검증 단계:**
1. 입력값 검증
2. user 존재 확인
3. subscription INSERT/UPSERT
4. software_licenses INSERT/UPSERT
5. license_activations INSERT/UPSERT

**반환 (성공 시):**
```jsonc
{
  "success": true, "code": "OK",
  "payment_no": "PAY_...",
  "license_key": "...",
  "subscription_id": "UUID"
}
```

**호출 위치:** `dashboard/page.tsx:278`
**참고:** 현재 `o_error_message` / `o_verify_key` / `o_license_key` / `o_payment_no` 패턴 사용 중 → JSONB로 변경

---

## 4. 프론트엔드 수정 범위

| 파일 | 변경 내용 |
|------|----------|
| `MainEditorApp.tsx` | `checkActivation` 폴링 → `check_license_session` RPC로 교체 |
| `MainEditorApp.tsx` | 접속자수 초과 체크 (line 943-954) → `check_license_session` RPC로 교체 |
| `useEditorHandlers.ts` | `delete_license_activation` 응답 처리 추가 |
| `Navbar.tsx` | `deactivate_session_on_logout` 응답 처리 추가 |
| `dashboard/page.tsx` | `upsert_user` / `delete_device_activation` / `subscribe_user_plan` 응답 처리 변경 |
| `LicenseModal.tsx` | `upsert_license_activation` 응답 처리 추가 |

---

## 5. 마이그레이션 순서

```
Phase 1 (check_license_session)
  ├─ SQL 생성
  └─ MainEditorApp.tsx 폴링/체크 교체

Phase 2 (delete_license_activation + deactivate_session_on_logout)
  ├─ SQL 생성 (2개)
  ├─ useEditorHandlers.ts 수정
  └─ Navbar.tsx 수정

Phase 3 (upsert_license_activation + delete_device_activation)
  ├─ SQL 생성 (2개)
  ├─ LicenseModal.tsx 수정
  └─ dashboard/page.tsx 수정

Phase 4 (upsert_user + subscribe_user_plan)
  ├─ SQL 생성 (2개)
  └─ dashboard/page.tsx 수정

검증
  ├─ TypeScript 컴파일 확인
  ├─ npm run build
  └─ Cloudflare Pages 배포
```
