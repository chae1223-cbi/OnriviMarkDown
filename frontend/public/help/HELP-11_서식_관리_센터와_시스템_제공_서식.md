---
메타영역
#서식설정
title: "HELP-11: 서식 관리 센터와 시스템 서식"
description: "서식 관리 센터와 시스템 서식의 현재 사용 방법과 지원 범위 안내."
url: "https://onrivi.com/help/HELP-11_서식_관리_센터와_시스템_제공_서식"
version: 1.1.0
lastUpdated: 2026-10-14
css_profile: system-1
css_profile_name: "Onrivi 기본서식"
---

이전: [이미지·동영상·지도와 리소스 관리](/help/HELP-10_이미지_미디어_첨부와_리소스_경로_관리.md) | [전체 목차](/help/00_시작하기.md) | 다음: [큰 글자와 읽기 편한 서식 설정](/help/HELP-12_시니어_독자를_위한_추천_조판_가이드.md)

## 1. 서식관리 열기

오른쪽 팔레트 도구, 하단 서식 이름 또는 `/서식`을 사용합니다. 서식 프로필은 본문의 글꼴·행간·용지·제목·표·인용문·미디어 디자인을 관리합니다.

![서식관리 예시](/help/assets/fig6_css_gallery.png)

## 2. 문서와 서식 연결

```yaml
---
css_profile: system-1
css_profile_name: "Onrivi 기본서식"
---
```

문서 상단의 서식 정보로 프로필을 연결합니다. 메타영역은 문서 화면에서 숨겨집니다. 서식 변경을 파일에 남기려면 문서를 저장하세요.

사용자 서식은 리소스 `profiles/userCssProfiles.json`에 보관합니다. 다른 기기에도 같은 사용자 서식이 있어야 같은 디자인을 복원할 수 있습니다.

## 3. 제공 서식

| 서식 | ID |
| --- | --- |
| Onrivi 기본서식 | `system-1` |
| 기술 표준 | `github-readme-style` |
| 법률·계약서 A4 | `legal-contract-a4` |
| 네이버 블로그 | `naver-blog-style` |
| 기술서적 | `profile-tech-book-2026` |
| 행사·가정통신문 | `profile-official-notice-letter` |
| 한컴 테크 블로그 | `hancom-tech-blog` |
| 편안한 전자책 | `profile-1791514218283` |

시스템 서식은 원본 보호가 적용됩니다. 개인 수정은 해당 서식을 바탕으로 사용자 서식을 만들어 진행합니다. 현재 문서보기에는 표 헤더 중앙 정렬·셀 문단 여백 제거·코드 가로 스크롤 같은 편집용 규칙도 적용됩니다.

---

이전: [이미지·동영상·지도와 리소스 관리](/help/HELP-10_이미지_미디어_첨부와_리소스_경로_관리.md) | [전체 목차](/help/00_시작하기.md) | 다음: [큰 글자와 읽기 편한 서식 설정](/help/HELP-12_시니어_독자를_위한_추천_조판_가이드.md)
