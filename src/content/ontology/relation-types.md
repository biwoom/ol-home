---
title: OL 온톨로지 — 관계 유형
version: "0.1.0"
published: true
---

# OL Relation Types

OL 지식 그래프에서 사용하는 관계(predicate) 유형 정의.

## 인물 관계

| predicate | 설명 | 예시 |
|-----------|------|------|
| `taught` | 가르침을 주었다 | 붓다 → taught → 아난다 |
| `was_taught_by` | 가르침을 받았다 | 나가르주나 → was_taught_by → 라훌라바드라 |
| `founded` | 창립했다 | 나가르주나 → founded → 중관학파 |
| `wrote` | 저술했다 | 나가르주나 → wrote → 중관론 |
| `born_in` | 태어난 곳 | 붓다 → born_in → 룸비니 |
| `attained_enlightenment_in` | 깨달음을 얻은 곳 | 붓다 → attained_enlightenment_in → 보드가야 |
| `died_in` | 입적한 곳 | 붓다 → died_in → 쿠시나가라 |
| `was_disciple_of` | 제자 관계 | 아난다 → was_disciple_of → 붓다 |

## 개념 관계

| predicate | 설명 | 예시 |
|-----------|------|------|
| `defines` | 정의의 근거가 되는 경전 | 공 → defines → 반야심경 |
| `is_related_to` | 관련 개념 | 공 → is_related_to → 연기 |
| `is_basis_of` | 상위 개념 | 연기 → is_basis_of → 공 |
| `originated_in` | 기원한 학파/전통 | 공 → originated_in → 중관학파 |

## 문헌 관계

| predicate | 설명 | 예시 |
|-----------|------|------|
| `belongs_to` | 소속 경전 계통 | 중관론 → belongs_to → 중관학파 |
| `cites` | 인용 관계 | A 논서 → cites → B 경전 |
| `is_commentary_on` | 주석 대상 | 주석서 → is_commentary_on → 원전 |
