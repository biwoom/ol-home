---
title: "OL ATLAS 코드 구조 리팩토링 — 3,000줄 파일을 해체하다"
description: "modal.css 3,011줄을 6개 파일로 분리하고, JS 순환 의존성을 해소하고, 기능 단위로 코드를 재배치한 과정을 정리합니다."
date: 2026-06-01
category: ATLAS
readingTime: 7
tags: ["개발", "리팩토링", "유지보수"]
prefixTags:
  - "kind:blog"
  - "project:atlas"
  - "topic:development"
  - "topic:refactoring"
  - "topic:maintenance"
published: true
---

## 왜 정리가 필요했나

OL ATLAS는 단일 HTML 파일로 동작하는 콘텐츠 에디터입니다. 프레임워크 없이 Vanilla JS로 작성되어 있고, esbuild로 번들링한 뒤 HTML 셸에 인라인하여 자기완결형 파일을 만듭니다.

기능이 늘어나면서 코드도 함께 자랐는데, 문제는 **자라는 방향이 한쪽으로 쏠렸다**는 것입니다.

`modal.css`라는 이름의 파일이 3,011줄까지 불어나 있었습니다. 이름은 "모달"이지만 실제로는 About 뷰, 휴지통, 모바일 반응형, 마크다운 에디터, 벌크 선택, 홈 랜딩 페이지, 인쇄 스타일, 커스텀 셀렉트 — 거의 모든 것이 들어있었습니다. 정작 모달 관련 스타일은 200줄 정도뿐이었습니다.

JS 쪽도 비슷했습니다. `about.js`에 휴지통 로직이 함께 있고, `events.js`에 리스트뷰 팝오버 전체 UI가 들어있고, `constants.js`에 이미지 처리 함수가 있었습니다. 파일 이름만 보고는 무엇이 어디 있는지 알 수 없는 상태였습니다.

## 무엇을 했나

### CSS: modal.css 해체 (3,011줄 → 310줄 + 5개 신규 파일)

| 신규 파일 | 줄 수 | 분리된 내용 |
|---|---|---|
| `about.css` | 449 | About 뷰 + 휴지통 뷰 + 편집 기록 |
| `mobile.css` | 433 | 모바일 반응형, 햄버거, 모바일 검색 |
| `md-editor.css` | 413 | 마크다운 에디터 툴바, 슬래시 메뉴, 이미지 패널 |
| `bulk-select.css` | 449 | 다중 선택, 라쏘, 액션바, 팝오버 |
| `home.css` | 514 | 홈 랜딩 페이지 전체 |
| `misc.css` | 395 | 토스트, 컬러 피커, 인쇄, 커스텀 셀렉트 |

`modal.css`에는 이제 모달/다이얼로그, 카드 모달 헤더, 필드, 토글 그룹 등 **실제 모달 관련 스타일만** 310줄이 남아 있습니다.

CSS는 `inline.mjs`의 `CSS_FILES` 배열 순서대로 단순 concat되므로, 분리 후에도 같은 순서를 유지하면 출력 결과가 동일합니다. 가장 안전한 작업이었습니다.

### JS: 기능 단위 분리

**about.js → trash.js 분리**

About 뷰와 휴지통은 별개의 뷰인데 한 파일에 있었습니다. 휴지통 렌더링(`renderTrash`), 이벤트 핸들러(`initTrashHandlers`), 사이드바 링크 생성(`buildAboutTrashSection`)을 `trash.js`로 분리했습니다.

**events.js → listview.js 이동**

`events.js`에 126줄짜리 리스트뷰 컬럼 설정 팝오버가 IIFE로 들어있었습니다. DOM 생성, 드래그 정렬, 체크박스까지 포함된 완전한 UI 컴포넌트여서 `listview.js`로 옮겼습니다.

**constants.js → body-helpers.js 이동**

`newImgId`, `safeImgAlt`, `bodyImagesToTokens`, `bodyTokensToStandardMd` — 이미지 토큰 변환 함수 4개가 "상수" 파일에 있었습니다. 본문 처리 유틸인 `body-helpers.js`로 이동했습니다.

**export-import.js → zip.js + md-parser.js 분리**

601줄짜리 파일에서 순수 유틸 두 개를 독립 모듈로 뽑았습니다:
- `zip.js` (99줄) — ZIP 포맷 생성기
- `md-parser.js` (71줄) — 마크다운 프런트매터 파서

### 순환 의존성 해소

리팩토링 전에 순환 의존성이 하나 있었습니다:

```
card-modal → md-editor → tag-filter → search → card-modal
```

원인은 `tag-filter.js`에 태그 필터와 무관한 `_currentEditingCard` 상태가 들어있었기 때문입니다. 이 변수를 `editing-state.js`(6줄)로 분리하여 순환 고리를 끊었습니다.

### Dead code 정리

아무 데서도 import하지 않는 파일 3개를 발견하고 삭제했습니다:

- `view-actions.js` — reducer가 등록되지만 매칭되는 action이 없음 (라우터가 대체)
- `history.js` — undo/redo placeholder (2줄)
- `toc.js` — 리다이렉트 주석만 (1줄)

### 라이선스 변경

`CC BY-SA 4.0`에서 `CC0 1.0`으로 변경했습니다. OL 홈페이지에 표기된 CC0와 통일했습니다. 단일 HTML 파일로 배포되는 OL의 특성상, 받는 사람에게 라이선스 유지 의무를 부과하지 않는 CC0가 "자유로운 수정과 전달"이라는 프로젝트 철학과 일치합니다.

## 정리 후 구조

```
src/styles/          16개 CSS 파일, 총 6,121줄
                     가장 큰 파일: sidebar.css (821줄)
                     평균: ~380줄

src/core/            24개 JS 파일 — 상태관리, 라우팅, 유틸, 파서
src/actions/          4개 JS 파일 — 도메인별 액션/리듀서
src/components/      13개 JS 파일 — 뷰 컴포넌트
src/ui/               3개 JS 파일 — 범용 UI (모달, 셀렉트, 에디터 모달)
src/data/             2개 JS 파일 — 초기화, 검색

순환 의존성: 0개
Dead code: 0개
빌드 크기: JS 195KB, HTML 397KB
```

## 위험 관리

코드 재배치에서 가장 위험한 것은 **side-effect를 가진 코드가 import 체인에서 빠지는 것**입니다. `addEventListener`를 top-level에서 호출하는 파일이 import되지 않으면 이벤트가 등록되지 않아 버튼이 죽습니다.

매 단계마다 `npm run build`로 빌드를 검증하고, 분리 전후의 번들 크기를 비교했습니다. CSS 분리(가장 안전)부터 시작해서 JS 분리(주의 필요)로 진행하고, 순환 의존성 변경은 가장 마지막에 처리했습니다.

---

*OL ATLAS v0.0.7 · 2026-06-01*
