export const primaryKindLabel: Record<string, string> = {
  infographic: '인포그래픽',
  illustration: '삽화',
  'style-sheet': '스타일시트',
  reference: '레퍼런스',
};

export const primaryKindOrder = [
  'infographic', 'illustration', 'style-sheet', 'reference',
] as const;

export const typeLabel: Record<string, string> = {
  infographic:  '인포그래픽',
  timeline:     '연표',
  diagram:      '도식',
  map:          '지도',
  comparison:   '비교표',
  flowchart:    '흐름도',
  'concept-map': '개념 지도',
  'style-sheet': '스타일시트',
  illustration: '삽화',
  poster:       '포스터',
  turnaround:   '턴어라운드',
  portrait:     '인물 · 도상',
  costume:      '복장 · 가사',
  architecture: '건축 · 사찰',
  landscape:    '지역 · 자연',
  manuscript:   '원문 · 필사',
  artifact:     '유물 · 공예',
  other:        '기타',
};

export const typeOrder = [
  'infographic', 'timeline', 'diagram', 'map', 'comparison',
  'flowchart', 'concept-map', 'poster',
  'illustration', 'style-sheet', 'turnaround',
  'portrait', 'costume', 'architecture', 'landscape',
  'manuscript', 'artifact', 'other',
] as const;

export const formatLabel: Record<string, string> = {
  html: 'HTML',
  pdf: 'PDF',
  image: 'IMAGE',
  mixed: 'HTML/PDF',
};
