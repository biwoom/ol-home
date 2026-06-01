export const typeLabel: Record<string, string> = {
  illustration: '삽화',
  infographic:  '인포그래픽',
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
  'illustration', 'infographic', 'poster', 'turnaround',
  'portrait', 'costume', 'architecture', 'landscape',
  'manuscript', 'artifact', 'other',
] as const;
