# OnriviAuthor 작업 지침

기존 프로젝트 규칙은 [.agents/AGENTS.md](.agents/AGENTS.md)를 따른다.

## 필수 스킬 참조

- DB 접근, SQL, 트랜잭션, DB 관련 API 또는 데이터 변경 로직을 편집하기 전에 [skills/onrivi-db-processing/SKILL.md](skills/onrivi-db-processing/SKILL.md)를 읽고 적용한다.
- 서버 또는 클라이언트의 오류 응답, 예외 처리, 오류 로그, 사용자 오류 알림을 편집하기 전에 [skills/onrivi-error-handling/SKILL.md](skills/onrivi-error-handling/SKILL.md)를 읽고 적용한다.
- DB 처리 코드를 편집할 때는 실패 경로와 오류 정보도 함께 검토하므로 **두 스킬을 모두** 읽는다. 오류 처리 코드가 DB 오류를 다룰 때도 두 스킬을 모두 읽는다.
- 스킬의 적용 범위는 해당 작업에 한정한다. 기존 API 계약이나 인증 동작을 임의로 바꾸지 않는다.
