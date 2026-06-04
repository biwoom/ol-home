---
title: "OL ATLAS — 마크다운 각주 구현기: 자체 파서 확장과 해시 라우터 충돌 해결"
description: "자체 마크다운 파서에 각주 기능을 추가하면서 만난 세 가지 문제 — 해시 라우터 충돌, 뷰 간 ID 중복, 고정 헤더 가림 — 을 해결한 과정을 기록합니다."
date: 2026-05-31
category: ATLAS
readingTime: 7
tags: ["ATLAS", "개발", "마크다운"]
prefixTags:
  - "kind:blog"
  - "project:atlas"
  - "topic:development"
  - "topic:markdown"
  - "feature:footnotes"
published: true
---

OL ATLAS는 외부 라이브러리 없이 자체 마크다운 파서(`markdown.js`)를 사용한다. 코드 블록, 인용, 목록, 이미지 등 기본 문법을 지원하지만, 불교 원전 작업에서 자주 쓰이는 **각주**가 빠져 있었다.

이 글은 마크다운 각주 기능을 자체 파서에 추가하면서 만난 세 가지 문제와 해결 과정을 기록한다.

## 앱 버전 동적 반영 — 작은 개선 하나

각주 작업 전에 작은 문제를 먼저 고쳤다. 홈 화면에 표시되는 앱 버전이 `state.js`에 `'0.0.1'`로 하드코딩되어 있었다. `package.json`의 버전을 올려도 화면에는 반영되지 않는 구조였다.

빌드 파이프라인(`inline.mjs`)이 이미 `package.json` 버전을 읽어 `window.__OL_BUILD__`에 주입하고 있었으므로, 이것을 참조하도록 두 곳만 수정했다.

```javascript
// state.js — 새 상태 생성 시
version: (typeof window !== 'undefined' && window.__OL_BUILD__?.version) || '0.0.1',

// home.js — 홈 화면 표시 시 (빌드 버전 우선)
const appVersion = (typeof window !== 'undefined' && window.__OL_BUILD__?.version) || meta.version;
```

이제 `package.json`의 `version`을 올리고 빌드하면 홈 화면에 자동 반영된다.

## 각주 구현: 2-pass 파서 확장

### 마크다운 각주 문법

표준 확장 문법을 따랐다:

```markdown
연기(緣起)란 모든 현상이 조건에 의해 생겨남을 뜻한다[^1].
중관학파는 이를 공(空)과 동일시한다[^nagarjuna].

[^1]: 팔리어 paṭiccasamuppāda, 산스크리트어 pratītyasamutpāda.
[^nagarjuna]: 용수(龍樹), 《중론》 제24품 참조.
```

본문에 `[^key]`로 참조를 달고, 문서 어디에든 `[^key]: 내용`으로 정의를 적는다.

### 설계 결정: 어디를 수정할 것인가

ATLAS의 마크다운 렌더링은 `parseMarkdown()` 한 함수로 통일되어 있다. 문서뷰, 독서뷰, 카드 미리보기, 에디터 프리뷰 — 모두 이 함수를 호출한다. 따라서 `markdown.js` 하나만 수정하면 전체 뷰에 각주가 적용된다.

### 구현 구조: 전처리 → 기존 파싱 → 후처리

기존 파서는 라인 단위로 동작한다. 각주를 끼워넣기 위해 2-pass 구조를 도입했다.

**1단계 — 각주 정의 수집 (전처리)**

파싱 시작 전에 `[^key]: 내용` 패턴의 라인을 모두 추출하고 Map에 저장한다. 해당 라인은 본문에서 제거된다. 들여쓰기된 연속 줄은 같은 각주의 멀티라인 내용으로 처리한다.

```javascript
const _fnTopLevel = !ctx._footnotes;
if (_fnTopLevel) {
  ctx._footnotes = new Map();
  ctx._fnOrder = new Map();
  ctx._fnCounter = 0;
  // [^key]: 내용 패턴을 추출하고 lines에서 제거
}
```

`_fnTopLevel` 플래그는 재귀 호출(블록인용 내부)에서 각주를 중복 추출하지 않기 위한 가드다.

**2단계 — 참조 치환 (인라인)**

`parseInline()`에서 `[^key]`를 만나면 등장 순서대로 번호를 매기고 상단첨자 링크로 변환한다.

```html
<sup class="md-fn-ref"><a href="#fn-1" id="fnref-1">1</a></sup>
```

이 처리는 이미지 `![]()`와 링크 `[]()` regex 사이에 배치했다. `[^key]`에는 괄호가 없으므로 링크 regex와 충돌하지 않지만, 순서를 보장하기 위해 링크 처리 직전에 넣었다.

**3단계 — 각주 섹션 렌더링 (후처리)**

파싱 완료 후, 참조된 각주가 있으면 하단에 각주 섹션을 추가한다.

```html
<section class="md-footnotes">
  <ol class="md-fn-list">
    <li id="fn-1">팔리어 paṭiccasamuppāda... <a class="md-fn-back">↩</a></li>
  </ol>
</section>
```

`stripMarkdown()`에도 각주 정의와 참조를 제거하는 패턴을 추가해서, 검색 인덱싱 시 각주 문법이 노이즈로 남지 않게 했다.

## 문제 1: 해시 라우터 충돌

각주 링크 `<a href="#fn-1">`을 클릭하면 **홈 화면으로 전환**되는 버그가 발생했다.

원인은 ATLAS의 해시 기반 라우터였다. `routeFromHash()`는 `hashchange` 이벤트를 감지해서 `#kanban`, `#document/slug` 같은 패턴을 처리한다. `#fn-1`은 어떤 패턴에도 매칭되지 않아 `else` 절로 빠지고, 그 절은 홈으로 전환한다.

```javascript
// router.js — routeFromHash()
} else {
  switchView('home');  // ← #fn-1이 여기로 빠짐
}
```

**해결**: 각주 링크 클릭을 `preventDefault()`로 가로채고, `scrollIntoView()`로 직접 스크롤한다. 해시를 변경하지 않으므로 라우터가 개입하지 않는다.

```javascript
document.addEventListener('click', (e) => {
  const link = e.target.closest('.md-fn-ref a, .md-fn-back');
  if (!link) return;
  e.preventDefault();
  // scrollIntoView로 직접 이동
});
```

이벤트 위임 방식이라 뷰가 다시 렌더링되어도 핸들러를 재등록할 필요가 없다.

## 문제 2: 뷰 간 ID 중복

문서뷰에서는 각주 스크롤이 잘 되는데, **독서뷰에서는 작동하지 않았다**.

ATLAS는 모든 뷰를 DOM에 동시에 갖고 있고 `display: none/block`으로 전환한다. 같은 카드를 문서뷰와 독서뷰에서 동시에 렌더링하면 `fn-1`, `fnref-1` 같은 ID가 **두 번** 존재한다.

`document.getElementById('fn-1')`은 DOM 순서상 먼저 나오는 문서뷰(숨겨진 상태)의 요소를 반환한다. 독서뷰에서 클릭해도 보이지 않는 문서뷰 요소로 스크롤을 시도하고 있었다.

**해결**: 클릭이 발생한 `.view` 컨테이너 내에서만 타겟을 탐색한다.

```javascript
const view = link.closest('.view') || document;
const target = view.querySelector('#' + CSS.escape(targetId));
```

`closest('.view')`로 현재 활성 뷰를 특정하고, 그 안에서 `querySelector`로 찾는다. 각 뷰가 자기 영역의 각주만 참조하게 된다.

## 문제 3: 고정 헤더에 가려지는 스크롤 대상

문서뷰에서 하단 각주의 역참조(↩) 아이콘을 클릭하면 본문의 각주 번호 위치로 스크롤되지만, **헤더와 view-bar에 가려져** 실제로는 보이지 않았다.

문서뷰에는 고정 요소가 두 개 있다:
- `#header` — `position: fixed`, 높이 `56px` (`--header-h`)
- `.view-bar` — `position: sticky`, `top: var(--header-h)`

합치면 약 100px 이상을 상단에서 차지한다. `scroll-margin-top: 5rem`(80px)으로는 부족했다.

**해결**: CSS 변수를 활용해 정확한 오프셋을 계산한다.

```css
.md-fn-ref a,
.md-body .md-fn-list li {
  scroll-margin-top: calc(var(--header-h, 56px) + 3.5rem);
}
```

`--header-h`(56px) + `3.5rem`(56px) = 112px. 헤더와 view-bar를 모두 커버한다. 독서뷰에서는 topbar가 스크롤 시 자동 숨김되므로 여유 공간이 생겨 문제없다.

## 각주 하이라이트

각주 번호를 클릭하면 하단의 해당 각주에 2.5초간 배경색이 들어온다. 역참조 클릭 시에도 본문의 각주 번호가 하이라이트된다. 어디로 이동했는지 시각적으로 즉시 확인할 수 있다.

```css
.md-body .md-fn-list li.md-fn-highlight {
  background: hsl(var(--primary) / 0.12);
  color: hsl(var(--primary));
}
```

`transition`으로 등장과 소멸을 부드럽게 처리했다. 라이트/다크/독서 모드 모두에서 `--primary` CSS 변수를 참조하므로 테마별 별도 처리가 필요 없다.

## 역참조 아이콘

초기 구현에서는 `↩`(U+21A9) 문자를 사용했다. 기능적으로는 충분하지만, 프로젝트 전반의 SVG 아이콘 체계와 맞지 않았다. `currentColor`와 CSS 크기 제어가 가능한 인라인 SVG로 교체했다.

```css
.md-fn-back svg { width: 0.8em; height: 0.8em; }
```

`em` 단위를 사용해서 본문 글자 크기에 비례하고, `currentColor`로 테마 색상에 자동 대응한다.

## 정리

자체 마크다운 파서에 각주를 추가하는 것 자체는 2-pass 구조로 깔끔하게 해결됐다. 오히려 시간이 걸린 것은 ATLAS 고유의 아키텍처에서 비롯된 문제들이었다:

| 문제 | 원인 | 해결 |
|------|------|------|
| 클릭 시 홈 전환 | 해시 라우터가 `#fn-*`을 모르는 해시로 처리 | `preventDefault` + `scrollIntoView` |
| 독서뷰에서 스크롤 안 됨 | DOM에 같은 ID가 두 뷰에 동시 존재 | `closest('.view')` 스코프 내 탐색 |
| 헤더에 가려짐 | 고정 헤더 + sticky bar | `calc(--header-h + 3.5rem)` |

세 문제 모두 "단일 페이지에 여러 뷰가 공존하는 구조"에서 비롯됐다. SPA 프레임워크라면 라우터가 DOM을 교체하므로 ID 중복이 발생하지 않고, 네이티브 해시 스크롤도 그대로 동작한다. 하지만 ATLAS는 프레임워크 없이 모든 뷰를 DOM에 유지하는 구조를 선택했고, 그 대가로 이런 문제를 직접 해결해야 한다.

결과적으로 `markdown.js` 하나를 수정해서 문서뷰, 독서뷰, 카드 미리보기 전체에 각주가 적용됐다. 단일 진입점 설계의 장점이다.
