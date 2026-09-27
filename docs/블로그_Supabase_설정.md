# 블로그 Supabase 및 Cloudflare 설정

## 1. Supabase

1. 사용할 Supabase 프로젝트의 **SQL Editor**에서 [`database/blog_posts_setup.sql`](../database/blog_posts_setup.sql) 전체를 실행합니다. 두 테이블, 인덱스, RLS와 브라우저 직접 접근 차단이 한 DB 트랜잭션에서 설정됩니다. 트리거·저장 프로시저는 만들지 않습니다.
2. **Project Settings → Database → Connection string**에서 **Transaction pooler** URI를 복사합니다. 암호 부분을 실제 DB 암호로 채우고 `BLOG_DATABASE_URL` 또는 기존 `DATABASE_URL`로 보관합니다. 둘 다 있으면 `BLOG_DATABASE_URL`을 우선 사용합니다. 서버리스 연결용 pooler를 사용하며 SQL 쿼리는 준비된 문장에 의존하지 않습니다.
3. 기존 Supabase Auth의 URL과 anon key를 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 유지합니다. 관리자 API가 사용하는 기존 `SUPABASE_SERVICE_ROLE_KEY`도 서버 환경변수로 유지합니다. 이 값과 DB URL을 `NEXT_PUBLIC_` 이름으로 만들거나 저장소에 커밋하면 안 됩니다.
   DB 연결은 기본적으로 SSL 암호화를 요구합니다. 서버 인증서까지 검증하려면 Supabase **Database Settings → SSL Configuration**에서 CA 인증서를 받아 `BLOG_DATABASE_CA_CERT`에 PEM 내용을 넣습니다. 이 값을 설정하지 않으면 연결은 암호화되지만 서버 인증서 검증은 하지 않습니다.
4. 기존 관리자 역할(`SUPER` 또는 `SUPPORT`)과 MFA(AAL2)를 가진 계정으로 발행합니다. 일반 로그인 사용자는 초안 저장만 할 수 있습니다.

## 2. 문서 등록과 발행

기본 게시글은 제공하지 않습니다. 관리자 화면의 블로그 관리에서 `.md` 또는 `.markdown` 파일을 선택하고 제목·글 주소·요약·분류를 확인한 뒤 **초안 저장**을 누릅니다. 초안 목록에서 문서를 선택하여 **공개 배포 요청**을 누르면 DB 변경이 한 트랜잭션으로 저장되고 Pages 배포 훅이 호출됩니다. 개인 브라우저의 옛 `localStorage` 글은 자동 이관하거나 공개하지 않습니다.

## 3. Cloudflare Pages

1. **Settings → Variables and Secrets**에서 `BLOG_DATABASE_URL` 또는 `DATABASE_URL`, 기존 Supabase Auth 변수, 기존 `SUPABASE_SERVICE_ROLE_KEY`를 설정합니다. DB URL은 **빌드 시점과 Pages Functions 실행 시점 모두** 필요합니다. 환경별 Preview/Production 값을 각각 확인합니다.
2. **Settings → Builds & deployments → Deploy hooks**에서 배포 훅을 만들고 URL을 `CLOUDFLARE_PAGES_DEPLOY_HOOK` 비밀값으로 등록합니다. 훅은 관리자 API가 호출합니다.
3. 빌드 명령은 기존 `npm run build --prefix frontend`를 사용합니다. 이 명령은 공개 대상 게시글을 DB의 한 읽기 트랜잭션에서 읽고 정적 목록·상세·사이트맵을 생성합니다. 공개 글이 0개면 목록만 생성합니다. DB 연결이 실패하면 배포 빌드도 실패합니다. `BLOG_USE_LOCAL_SNAPSHOT=1`은 **로컬 빈 목록 빌드 검증 전용**이며 운영 환경에는 설정하지 않습니다.

저장·발행·비공개·삭제의 여러 SQL 변경은 각 API 요청마다 하나의 PostgreSQL 트랜잭션으로 처리됩니다. Cloudflare 배포 훅은 DB 트랜잭션 밖의 HTTP 요청이므로 원자적 커밋에 포함되지 않습니다. 훅 호출 실패 시 DB의 배포 대기 상태가 남습니다. 현재 API는 배포 **요청**까지만 확인하며 Cloudflare 배포의 최종 성공 상태 확인과 `live_revision_id` 확정은 별도 연동이 필요합니다. 따라서 관리자 화면의 배포 요청 메시지를 실제 공개 완료로 해석하면 안 됩니다.

참고: [Supabase 연결 방식](https://supabase.com/docs/guides/database/connecting-to-postgres), [Cloudflare Pages 배포 훅](https://developers.cloudflare.com/pages/configuration/deploy-hooks/).
