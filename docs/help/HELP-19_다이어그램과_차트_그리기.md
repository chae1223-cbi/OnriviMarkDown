---
title: "Mermaid 다이어그램과 도식"
description: "현재 구현 기준 사용 방법과 제한 안내"
version: 1.2.0
lastUpdated: 2026-10-22
css_profile: onrivi-help
css_profile_name: "온리비 도움말"
---

# Mermaid 다이어그램과 도식

> **<u>Mermaid는 별도의 그래픽 소프트웨어 없이 텍스트 문법으로 관계도·흐름도를 작성해 수려한 벡터 다이어그램으로 조판하는 기능입니다.</u>** 지원되는 차트 종류는 포함된 렌더러 버전에 따라 달라집니다.

## 1. 작성 문법과 대표 차트

````markdown
```mermaid
flowchart LR
    A[자료 수집] --> B[초안 작성]
    B --> C[검토]
    C --> D[출판]
```
````

대표적으로 지원되는 다이어그램:
- **순서도 (Flowchart)**: `flowchart TD` (상하) / `flowchart LR` (좌우)
- **시퀀스 다이어그램 (Sequence Diagram)**: `sequenceDiagram`, 참여자 간 메시지 흐름
- **간트 차트 (Gantt Chart)**: `gantt`, 일정 및 타임라인 계획
- **클래스 및 상태 다이어그램**: `classDiagram`, `stateDiagram-v2`

## 2. Mermaid 독립 확대 줌 뷰어 (데스크톱 특장점)

온리비 어서 데스크톱 앱에서는 미리보기 화면에 렌더링된 Mermaid 다이어그램을 클릭하면 **독립된 새 창에서 Mermaid 줌 뷰어(`mermaid:open-window`)가 열립니다**:
- 마우스 휠을 통해 다이어그램을 자유롭게 확대/축소(Zoom In/Out)할 수 있습니다.
- 마우스 드래그로 복잡하고 거대한 순서도나 시스템 구조도를 화면 구석구석 이동(Pan)하며 나노 단위로 세밀하게 검토할 수 있습니다.

## 3. 출력과 주의 사항

인쇄·PDF 사출 시 Mermaid 다이어그램은 깨끗한 고해상도 벡터 그래픽으로 사출됩니다. EPUB 및 외부 문서 포맷의 경우 전자책 리더기의 엔진에 따라 SVG 이미지로 자동 인라인화되어 처리됩니다.

외부 사이트 예시를 복사할 때는 Mermaid 코드만 코드 블록 안에 넣으세요. 예시를 감싸는 바깥 코드 울타리까지 중복으로 붙이면 일반 코드로 표시될 수 있습니다.


---

[도움말 전체 목차](./00_시작하기.md)
