---
title: "DESIGN은 인포그래픽으로, WORKS는 문서 라이브러리로"
description: "OL DESIGN을 인포그래픽 중심 라이브러리로 재정의하고, OL WORKS를 BOOK의 전 단계가 아닌 살아 있는 문서 라이브러리로 정리한 작업 기록."
date: 2026-06-04
category: OL
readingTime: 6
tags: ["DESIGN", "WORKS", "인포그래픽", "문서라이브러리"]
prefixTags:
  - "kind:blog"
  - "project:design"
  - "project:works"
  - "topic:infographic-library"
  - "topic:document-library"
published: true
---

오늘 작업은 메뉴 두 개의 성격을 다시 잡는 일이었다. 하나는 DESIGN, 다른 하나는 WORKS다.

둘 다 처음 만든 구조에서는 임시적인 성격이 강했다. DESIGN은 스타일 레퍼런스 아카이브에 가까웠고, WORKS는 BOOK으로 가기 전의 원고 저장소처럼 보였다. 하지만 실제로 OL이 만들려는 것은 단순한 저장소가 아니라 읽고, 고치고, 다시 배포할 수 있는 지식의 형식이다. 그래서 두 메뉴의 정의를 다시 세웠다.

## DESIGN — 스타일 레퍼런스에서 인포그래픽 라이브러리로

DESIGN의 중심을 인포그래픽으로 옮겼다.

기존 DESIGN은 이미지 레퍼런스를 모아두는 성격이 강했다. 캐릭터 시트, 턴어라운드, 스타일시트 같은 자료들이 중심에 있었고, 실제 페이지 문구도 "스타일 레퍼런스 아카이브"에 가까웠다.

이 방향은 보조 자료로는 유효하지만, OL 전체 구조의 중심과는 조금 떨어져 있었다. OL이 다루는 핵심은 불교의 개념, 수행 체계, 문헌 구조, 번역과 주석이다. 이 내용은 단순 이미지보다 인포그래픽과 더 잘 맞는다. 그래서 DESIGN을 다음처럼 재정의했다.

```text
1차 콘텐츠: 인포그래픽
보조 콘텐츠: 삽화, 스타일시트, 레퍼런스
기본 산출물: HTML + PDF
목록 탐색: 썸네일 이미지
상세 미리보기: preview 이미지
```

이제 DESIGN 상세 페이지의 핵심 버튼은 `웹브라우저로 보기`와 `PDF 다운로드`다. preview 이미지는 미리보기용 보조 자산으로만 사용한다. 인포그래픽에서는 이미지 다운로드 버튼을 없앴다. 필요한 사람은 브라우저에서 이미지를 저장할 수 있고, 공식 산출물은 HTML과 PDF로 충분하다.

이미지 자체가 주 산출물인 자료, 예를 들어 삽화나 스타일시트에는 여전히 이미지 다운로드 버튼을 둘 수 있다. 하지만 인포그래픽에서는 산출물의 위계를 분명히 하는 편이 낫다.

## DESIGN 스키마 확장

인포그래픽 중심으로 가기 위해 DESIGN 스키마도 확장했다.

추가한 주요 필드는 다음과 같다.

```yaml
primaryKind: infographic
format: mixed
thumbnailPath: ""
imagePath: ""
previewPaths: []
htmlPath: ""
pdfPath: ""
prefixTags: []
version: ""
status: published
```

`thumbnailPath`는 목록 카드용이다. `imagePath`는 대표 미리보기 이미지다. preview 이미지가 여러 장이면 `previewPaths`에 순서대로 넣는다.

예를 들어 A4 두 페이지짜리 인포그래픽은 이렇게 등록한다.

```yaml
thumbnailPath: "lamrim-Infographic/thumb.jpeg"
imagePath: "lamrim-Infographic/preview1.jpg"
previewPaths:
  - "lamrim-Infographic/preview1.jpg"
  - "lamrim-Infographic/preview2.jpg"
htmlPath: "lamrim-Infographic/lamrim-Infographic.html"
pdfPath: "lamrim-Infographic/lamrim-Infographic.pdf"
```

Astro가 `public/`의 JPG를 자동으로 WebP로 바꿔주지는 않는다. 그래서 메타데이터에는 실제 파일 확장자를 그대로 적는 것이 원칙이다. 지금 단계에서는 JPG/JPEG 산출물을 그대로 쓰고, 나중에 자료가 많아지면 별도 최적화 파이프라인을 검토하면 된다.

## 새 인포그래픽 등록

오늘 DESIGN에 실제 인포그래픽 두 개를 등록했다.

- 람림 삼사도 — 보리도차제론의 수행체계
- 몸과 마음의 정화 여섯 단계

둘 다 HTML과 PDF를 함께 가진다. 목록에서는 썸네일을 보여주고, 상세 페이지에서는 preview 이미지를 보여준다. HTML은 브라우저에서 바로 열고, PDF는 내려받아 보관하거나 인쇄할 수 있다.

이 작업을 하면서 기존 WALL·E 샘플은 공개 DESIGN 페이지에서 제거했다. 샘플 이미지와 메타데이터는 `.ol-ref/샘플/design/wall-e/`로 옮겼다. DESIGN 페이지는 이제 외부 샘플이 아니라 실제 OL 인포그래픽을 보여준다.

## 공식 매뉴얼 정리

DESIGN 관련 공식 문서도 함께 고쳤다.

- `DESIGN 메뉴 파일 저장 구조와 관리법 최종.md`
- `DESIGN 콘텐츠 제작 매뉴얼.md`
- `OL 홈페이지 콘텐츠 관리 매뉴얼 v1.md`

핵심 변경은 세 가지다.

첫째, DESIGN은 인포그래픽 중심이다.  
둘째, HTML/PDF가 주 산출물이고 preview 이미지는 보조 자산이다.  
셋째, ENTITY 연결은 장기 확장 가능성으로 남기되 현재 운영은 prefix tag 중심으로 한다.

지금은 지식그래프보다 prefix tag가 더 현실적이다. `kind:infographic`, `topic:람림`, `format:pdf` 같은 태그는 바로 필터와 검색에 쓸 수 있다. 나중에 ENTITY가 실제 기능으로 안정화되면 이 태그들을 지식그래프와 연결하면 된다.

## WORKS — BOOK 이전 단계가 아니라 살아 있는 문서 라이브러리

WORKS도 다시 정의했다.

기존 WORKS는 "완결 이전의 초고, 번역 초안, 주석 연구"를 공개하는 공간으로 설명되어 있었다. 이 표현은 틀리지는 않지만, WORKS를 BOOK의 전 단계처럼 보이게 만든다.

이제 WORKS는 이렇게 정의한다.

> 지혜를 담는 문서 라이브러리. 번역, 주석, 연구 노트를 공개하는 살아 있는 문서 라이브러리. 붓다의 가르침을 담은 글들이 이곳에서 열리고, 고쳐지고, 이어집니다.

BOOK은 완결된 단일 HTML 출판물이다. WORKS는 계속 갱신되는 문서 라이브러리다. 둘은 위계가 아니라 성격이 다르다. 어떤 WORKS 문서는 나중에 BOOK으로 이어질 수 있지만, 모든 WORKS가 BOOK이 되기 위해 존재하는 것은 아니다.

그래서 메인 페이지의 WORKS 카드, WORKS 인덱스 페이지, 브랜드 문서, 운영 매뉴얼의 표현을 모두 문서 라이브러리 중심으로 바꿨다. 모바일 사이드바의 `원고 목록`도 `문서 목록`으로 바꿨다.

## 정리

오늘 바뀐 것은 UI 문구 몇 줄이 아니라 메뉴의 역할이다.

DESIGN은 불교 지식을 시각화하는 인포그래픽 라이브러리다.  
WORKS는 번역, 주석, 연구 노트가 계속 열리고 고쳐지는 문서 라이브러리다.  
BOOK은 완결된 콘텐츠를 단일 HTML로 배포하는 출판물이다.

이 세 메뉴가 서로 연결되면 OL HOME은 단순 포트폴리오가 아니라 불교 콘텐츠의 제작, 문서화, 시각화, 출판을 함께 담는 구조가 된다.

빌드는 통과했다. 다음 작업은 새 기준에 맞는 DESIGN 인포그래픽을 더 쌓고, WORKS 문서의 태그와 시리즈 구조를 더 분명히 정리하는 것이다.
