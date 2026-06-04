---
title: "OL HOME 구축기 — Phase 1~3, 온톨로지에서 검색까지"
description: "Astro 6 기반 정적 사이트를 세 단계에 걸쳐 구축한 과정. 온톨로지 설계, WORKS/BOOK 분리, 모바일 대응, Pagefind 검색까지의 핵심 결정들."
date: 2026-05-30
category: OL
readingTime: 10
tags: ["개발", "Astro", "검색"]
prefixTags:
  - "kind:blog"
  - "project:ol-home"
  - "topic:development"
  - "framework:astro"
  - "feature:search"
published: true
---

OL HOME은 단순 랜딩 페이지가 아니라, 온톨로지 기반 불교 콘텐츠 포털이다. Astro 6 + GitHub Pages 위에서 세 단계에 걸쳐 구축했다.

## Phase 1 — 기초 구조와 온톨로지

첫 번째 단계의 핵심은 "콘텐츠보다 스키마가 먼저"였다.

대부분의 콘텐츠 시스템은 태그로 관계를 표현하지만, `tags: [용수, 중관학]`만으로는 용수가 중관학을 창시했는지 비판했는지 알 수 없다. OL은 주어-관계-목적어(Triple) 구조로 의미를 보존한다.

```yaml
relations:
  - subject: nagarjuna
    predicate: founded
    object: madhyamaka-school
```

이 Semantic Layer 위에 7종 엔티티(인물, 장소, 개념, 경전, 사건, 수행, 학파)를 정의하고, Astro 6의 Content Layer API + glob 로더로 컬렉션을 구성했다. Phase 1 완료 시점에 14페이지 빌드 무오류.

## Phase 2 — WORKS/BOOK 분리와 콘텐츠 확장

Phase 2의 핵심 결정은 "제작 중"과 "완결"을 명확히 분리하는 것이었다.

```
src/content/works/   → 초고, 번역 초안 (챕터별 md)
src/content/book/    → 완결 출판물 메타데이터
public/books/        → 브라우저용 완결 HTML
```

WORKS 페이지는 시리즈별 그룹핑 + 사이드바 네비게이션 레이아웃을 갖추었다. 사이드바를 그리드 셀 안에 두면 토글 시 본문이 밀리는 문제가 생겨서, `position: fixed`로 분리하고 본문은 `margin-left` 전환으로 해결했다.

BLOG 페이지 신설, DESIGN 페이지 기초 구조(사이드바 필터 + 카드 그리드), 다크모드 토글도 이 단계에서 구현했다.

## 모바일 대응

가장 큰 문제는 WORKS의 `min-width: 1200px`이 모바일에서 가로 스크롤을 유발한 것이었다. 이 값을 제거하고, 900px 이하에서 사이드바를 드로어 방식으로 전환했다.

전체 브레이크포인트는 3단계로 정리했다:

- **1100px** — WORKS TOC 숨김
- **900px** — 사이드바 접기, 그리드 2컬럼 전환
- **600px** — 전체 1컬럼, 히어로 타이포 최소화

헤더는 하단 시트(bottom sheet) 방식 모바일 메뉴를 채택했다. 상단 드로어는 WORKS 사이드바와 z-index가 충돌할 수 있어서다.

## Phase 3 — Pagefind 검색

검색 엔진으로 Pagefind를 선택한 이유는 OL의 "self-contained" 철학과 맞기 때문이다. 서버 불필요, 클라이언트 JS 6KB 이내, 빌드 후 자동 인덱싱. Algolia 같은 외부 서비스는 선택지에서 제외했다.

검색 UI는 Command Palette(Cmd+K) 방식. 헤더 우측 돋보기 아이콘 클릭 또는 단축키로 모달이 열린다. `data-pagefind-body`를 `<main>`에 붙여 본문만 인덱싱하고, 헤더·푸터는 `data-pagefind-ignore`로 제외했다.
