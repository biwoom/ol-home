---
title: "BOOK과 DESIGN 파일 저장 구조 — 메타데이터 분리 전략"
description: "완결된 BOOK HTML과 DESIGN 이미지를 홈페이지에 등록하는 방법. 메타데이터와 실제 파일을 분리하는 이유와 구체적인 절차를 설명합니다."
date: 2026-05-28
category: OL
readingTime: 6
tags: ["BOOK", "DESIGN", "파일관리"]
prefixTags:
  - "kind:blog"
  - "project:book"
  - "project:design"
  - "topic:file-management"
  - "topic:metadata"
published: true
---

OL HOME에 BOOK이나 DESIGN 자료를 등록하려면 두 곳에 파일을 배치해야 한다. 메타데이터(md)와 실제 파일(HTML/이미지)을 분리하는 구조다.

## BOOK 등록 절차

BOOK은 "거대한 HTML + 가벼운 메타"다.

**1단계**: `public/books/` 아래에 폴더를 만들고 완성 파일을 `index.html`로 저장한다.

```
public/books/buddha-story/index.html
```

**2단계**: `src/content/book/` 에 메타데이터 md를 만든다.

```yaml
---
title: "붓다 스토리"
version: "v1.0"
publishedAt: 2026-06-01
htmlPath: "buddha-story"
description: "부처님의 일대기를 원전 기반으로 재구성"
tags: ["불전", "초기불교"]
published: true
---
```

`htmlPath`가 폴더명과 일치하면 웹에서 읽기와 다운로드 링크가 자동 생성된다. `download` 속성에 `제목-버전.html` 형식의 파일명이 자동으로 붙는다.

## DESIGN 등록 절차

DESIGN은 BOOK과 반대로 "가벼운 이미지 + 풍부한 메타"다. 폴더로 감쌀 필요 없이 파일을 바로 저장한다.

```
src/content/design/gandhara-face.md     ← 메타데이터
public/design/gandhara-face.jpg         ← 실제 이미지
```

메타데이터에 `imagePath: "gandhara-face.jpg"`를 적으면 목록 페이지와 상세 페이지에서 이미지가 자동 렌더링된다. 타입(portrait, costume, architecture 등), 시대, 지역, 출처, 라이선스 정보를 함께 기록할 수 있다.

## GitHub 용량 참고

개별 파일 100MB 이하, 저장소 전체 1GB 권장. 웹용 이미지(100KB~2MB)라면 수백 장까지 문제없다. 이미지가 500장을 넘으면 별도 저장소(OL-ASSETS)나 이미지 CDN 도입을 고려한다. md의 `imagePath`를 외부 URL로 바꾸기만 하면 되므로 구조 변경이 작다.
