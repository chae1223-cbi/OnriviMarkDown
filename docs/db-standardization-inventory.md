# DB 처리 방식 표준화 대상 목록

작성: 2026-11-01. 기준: `skills/onrivi-db-processing/SKILL.md`, `skills/onrivi-error-handling/SKILL.md`.

## 목표와 범위

- 클라우드 업무 테이블 접근은 서버의 PostgreSQL SQL로 통일한다. 업무별 쓰기는 하나의 연결과 트랜잭션에서 처리한다.
- Supabase Auth API(로그인, 사용자 토큰 확인, MFA, Auth 사용자 삭제)는 업무 테이블 접근과 구분한다. 로컬 SQLite는 PostgreSQL로 이전하지 않지만 **공통 오류 처리 표준화 대상**에 포함한다. 브라우저 지식 DB는 현재 사용 여부를 확인한 뒤 적용 범위를 정한다.
- `functions/api`가 배포 API이고 `frontend/functions/api`에 미러가 있다. 같은 경로를 함께 수정한다. `frontend/src/app/api`의 Next 라우트는 별도 구현이므로 동일 기능의 계약을 비교한다.
- 기존 PostgreSQL 사용 경로도 최종 방식의 예시일 뿐, 오류 처리·읽기 전용 쿼리의 트랜잭션 범위·연결 설정은 검토한다.

## 1순위: 여러 쓰기가 연결되어 부분 성공 위험이 있는 경로

| 작업 단위 | Cloudflare Functions | Next API / 관련 코드 | 확인할 핵심 |
| --- | --- | --- | --- |
| 구독 취소 | `functions/api/subscription/cancel.js` | `frontend/src/app/api/subscription/cancel/route.ts` | 대상 소유권, 활성 구독 상태, 영향 행 수, 기존 응답 |
| 구독 만료 | `functions/api/subscription/expire.js` | `frontend/src/app/api/subscription/expire/route.ts` | 구독·기기 비활성화·Reader 전환을 한 트랜잭션으로 묶기 |
| 구독 조회와 자동 상태 변경 | `functions/api/subscription/get.js` | `frontend/src/app/api/subscription/get/route.ts` | 조회 중 만료·생성·갱신이 발생함. 쓰기 경계를 분리하거나 한 트랜잭션으로 묶고 동시 요청 검토 |
| 데스크톱 라이선스 확인·기기 갱신 | `functions/api/license/verify-desktop.js` | `frontend/src/app/api/license/verify-desktop/route.ts` | 중복 기기, 기기 수 제한, 비활성화·재활성화의 원자성 |
| 기기 등록 해제 | `functions/api/device/deactivate.js`, `functions/api/rpc/device/delete.js` | `frontend/src/app/api/device/deactivate/route.ts`, `frontend/src/app/api/rpc/device/delete/route.ts` | ID와 소유권 검증, 삭제 결과, 두 경로의 역할 |
| 관리자 사용자·기기 정리 | `functions/api/admin/users.js`, `functions/api/admin/_shared.js` | `frontend/src/app/api/admin/users/route.ts` | 구독·기기·사용자·감사 로그의 삭제/변경 경계. Auth 사용자 삭제는 DB 트랜잭션 밖의 별도 단계로 설계 |
| 관리자 계정 관리 | `functions/api/admin/admins.js` | `frontend/src/app/api/admin/admins/route.ts` | 사용자/관리자 행 생성·수정·삭제 및 권한 검증 |
| 문의 접수 | `functions/api/rpc/support/insert.js` | `frontend/src/app/api/rpc/support/insert/route.ts` | Next의 Supabase insert → SQL fallback 제거, 사용자 연결과 문의 저장 일관화. 경로명 `rpc`는 실제 DB RPC 사용 여부와 별개 |

**첫 샘플:** `subscription/cancel.js`. 기존 REST 구현을 PostgreSQL로 옮기고 응답 계약·요청 ID·롤백을 검증한 뒤 다른 경로에 패턴을 적용한다. `subscription/get.js`는 조회 중 쓰기를 하므로 샘플 이후 별도 설계가 필요하다.

## 2순위: 관리자 및 콘텐츠 CRUD의 REST/SDK 제거

| 영역 | Cloudflare Functions | 대응 Next API |
| --- | --- | --- |
| 요금제 | `functions/api/plans.js`, `functions/api/admin/plans.js` | `frontend/src/app/api/plans/route.ts`, `frontend/src/app/api/admin/plans/route.ts` |
| FAQ | `functions/api/faqs.js`, `functions/api/faqs/[id].js` | `frontend/src/app/api/faqs/route.ts`, `frontend/src/app/api/faqs/[id]/route.ts` |
| 공통 코드 | `functions/api/admin/common-codes/index.js`, `functions/api/admin/common-codes/groups.js` | `frontend/src/app/api/admin/common-codes/route.ts`, `frontend/src/app/api/admin/common-codes/groups/route.ts` |
| 문의 관리 | `functions/api/admin/inquiries.js` | `frontend/src/app/api/admin/inquiries/route.ts` |
| 베타/프로모션 | `functions/api/beta/register.js`, `functions/api/beta/active-promotion.js` | `frontend/src/app/api/beta/register/route.ts`, `frontend/src/app/api/beta/active-promotion/route.ts` |

관리자 프로모션 화면 `frontend/src/app/admin/components/PromotionsTab.tsx`는 브라우저에서 `promotions`, `promotion_subscribers`를 직접 조회·변경한다. 서버 API로 옮길 때 함께 변경한다. 관리자 화면의 `CodesTab.tsx`, `FaqsTab.tsx`, `InquiriesTab.tsx`, `PlansTab.tsx`에도 브라우저 직접 테이블 접근이 있으므로 해당 API를 바꿀 때 호출 경로를 확인한다.

## 3순위: 이미 PostgreSQL인 경로의 일관성 점검

- 기준 구현: `functions/api/blog/_db.js`의 `withBlogTransaction`, `functions/api/subscription/create.js`, `functions/api/admin/users/plan.js`.
- 이미 해당 helper를 쓰는 경로: `functions/api/blog/{drafts,categories}.js`, `functions/api/admin/{blog,contents,audit-logs,system}.js`, `functions/api/admin/subscriptions/**`, `functions/api/device/{session-status,logout-session,dashboard-sessions}.js`, `functions/api/license/activate.js`, `functions/api/password/{request,confirm}.js`, `functions/api/user/{check,upsert,delete}.js`, `functions/api/admin/users.js` 일부.
- 별도 `pg.Client`를 만드는 `functions/api/license/check-session.js`는 공통 연결 방식과 대조한다.
- Next는 `frontend/src/lib/db.ts`의 `postgres` 라이브러리와 `sql` 태그를 사용한다. 해당 구현을 쓰는 Next 라우트(`admin/{audit-logs,contents,subscriptions,system,users/plan}`, `device/{dashboard-sessions,logout-session,session-status}`, `license/{activate,check-session}`, `subscription/{create,cancel,expire}` 등)는 Cloudflare 구현과 응답/업무 규칙을 비교한다. 런타임이 다르므로 무리하게 동일 연결 객체를 공유하지 말고 SQL·트랜잭션 규칙을 맞춘다.

## 브라우저 직접 업무 테이블 접근 점검

`frontend/src/app/dashboard/page.tsx`, `frontend/src/components/MainEditorApp.tsx`, `frontend/src/app/admin/page.tsx` 등에서 Supabase `.from()`으로 `users`, `subscriptions`, `common_codes`, `admins`를 읽는다. DB 접근을 서버로 통일하려면 실제 사용 중인 조회를 API로 옮긴다. Supabase Auth와 Realtime 구독은 별도 검토한다. 이 단계는 서버 API 전환 후 진행해 화면 계약을 안정화한다.

## 로컬 SQLite 공통 오류 처리 대상

SQLite는 PostgreSQL 서버 오류 함수 `serverError`를 그대로 가져다 쓰기 어려운 로컬 런타임이다. **오류 코드·작업 위치·진단 ID·안전한 사용자 메시지라는 규칙은 공유**하고, 로컬 API/클라이언트에 맞는 공통 오류 변환 함수를 마련한다. 서버 측 지식 API의 오류 응답과 화면 알림이 동일 진단 ID를 전달하도록 한다.

| 우선순위 | 대상 | 확인할 오류 경로 |
| --- | --- | --- |
| 높음 | `frontend/src/lib/knowledge/knowledgeDb.ts` | `node:sqlite` 초기화·연결, 잠금/손상, 트랜잭션 롤백, 백업·복원 실패. 파일 경로나 SQLite 원문을 사용자 메시지에 포함하지 않기 |
| 높음 | `frontend/src/lib/knowledge/knowledgeService.ts`, `frontend/src/lib/knowledge/knowledgeWorker.ts`, `frontend/src/lib/knowledge/knowledgeQueue.ts` | 색인 선행 처리 실패와 DB 쓰기 실패 구분, 작업 ID와 진단 ID 연결, 실패를 성공이나 빈 결과로 바꾸지 않기 |
| 높음 | `frontend/src/app/api/knowledge/{init,index,delete,collection,queue,queue/pop,queue/step,queue/complete}/route.ts` | 변경 작업의 4xx/5xx 응답 형식, 오류 코드·진단 ID·작업 단계, 원트랜잭션 실패 전파 |
| 중간 | `frontend/src/app/api/knowledge/{list,detail,search,query,queue/stats,resolve-path}/route.ts` | 조회 실패를 빈 목록·빈 통계로 숨기는 경로와 사용자에게 반환되는 원문 점검 |
| 중간 | `frontend/src/app/api/knowledge/{backup,restore}/route.ts` | 잠금·손상·유효하지 않은 백업 파일을 구분하고 복원 실패 시 경로/예외 원문 노출 방지 |
| 중간 | `frontend/src/lib/knowledge/knowledgeClient.ts`와 지식 화면 호출부 | API 오류의 진단 ID를 사용자 알림에 표시하고, Electron/브라우저 경로의 오류 계약 일치 확인 |
| 사용 여부 확인 | `frontend/src/lib/knowledge/browserKnowledgeDb.ts` | 브라우저 SQLite 경로가 실제 지원되는지 확인한 뒤 동일 오류 규칙 적용. 데스크톱 실패 시 임의 브라우저 DB 폴백 금지 |

SQLite 오류의 대표 코드 후보는 `SQLITE_NOT_AVAILABLE`, `DATABASE_LOCKED`, `DATABASE_CORRUPT`, `INVALID_BACKUP_FILE`, `RESOURCE_FOLDER_NOT_SET`이다. 실제 코드와 기존 사용자 안내 문구를 확인해 확정한다. 진단 로그에는 코드·작업 단계·진단 ID만 기본 기록하고 문서 내용, 전체 파일 경로, AI 입력, SQL문은 기록하지 않는다. 잠금/손상 자동 복구는 데이터 손실 위험이 있으므로 기존 동작을 검토하고 오류 처리 통일만을 이유로 확대하지 않는다.

## 작업 순서와 완료 조건

1. 샘플 구독 취소의 호출자·응답·DB 제약조건을 확인한다.
2. 관련 쓰기를 한 트랜잭션으로 옮기고 행 수/동시성/권한을 검증한다. 오류는 `serverError`와 요청 ID로 기록한다.
3. Cloudflare Functions와 미러를 동기화하고, 동일 기능의 Next API가 있다면 업무 규칙과 응답을 맞춘다.
4. 샘플 검증 후 1순위 → 2순위 → 3순위로 진행한다. DB 연결 실패·중간 쿼리 실패·업무 거절에서 부분 쓰기와 잘못된 성공 응답이 없는지 확인한다.
5. 변경 경로에 Supabase 업무 테이블 REST/SDK와 성공을 가장한 fallback이 남지 않았는지 확인한다. Auth·SQLite·Realtime의 처리 범위를 명시적으로 구분한다.
6. PostgreSQL 경로와 별도로 SQLite 지식 DB의 오류 변환 함수·API 응답·사용자 알림을 위 목록 순서로 통일한다. 로컬 DB 파일을 사용하는 실패 검증은 복사본에서 수행한다.

이 문서는 정적 코드 검색으로 만든 작업 목록이다. 각 항목을 편집할 때 실제 호출 여부, 스키마, 운영 환경, API 계약을 다시 확인한다.
