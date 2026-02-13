# 블로그 기능 로드맵

> 2026-02-13 작성. 각 배치별로 순서대로 구현 예정.

---

## Batch 1 — UX 향상

### 1-1. 읽기 진행 바
- 포스트 페이지 상단(헤더 아래)에 얇은 프로그레스 바 표시
- article 요소 기준 스크롤 진행률 계산
- 테마 accent 색상 활용
- `prefers-reduced-motion` 존중

### 1-2. Back to Top 버튼
- 일정 스크롤(300px+) 이후 우하단에 플로팅 버튼 표시
- 부드러운 fade-in/out 전환
- 테마 토큰 기반 스타일링
- 모바일에서도 동작

### 1-3. 헤딩 앵커 링크 복사
- 포스트 본문 heading(h2, h3, h4) hover 시 링크 아이콘 표시
- 클릭하면 해당 앵커 URL을 클립보드에 복사
- 복사 완료 피드백 (아이콘 변경 또는 토스트)
- rehype-autolink-headings가 이미 앵커를 생성하므로 CSS/JS만 추가

---

## Batch 2 — 콘텐츠 구조

### 2-1. 아카이브 페이지 (`/archive`)
- 모든 발행된 포스트를 연도별로 그룹핑
- 각 항목: 날짜 + 제목 (링크)
- 헤더 네비게이션에 추가
- 심플한 타임라인 UI

### 2-2. 포스트 시리즈
- frontmatter에 `series` (시리즈명), `seriesOrder` (순서) 필드 추가
- velite schema 확장
- 포스트 페이지에 시리즈 네비게이션 박스 표시 (예: "AI 시리즈 2/5")
- 시리즈 내 이전/다음 글 링크

---

## Batch 3 — 기술적 개선

### 3-1. View Transitions API
- Next.js App Router의 View Transitions 활용
- 페이지 이동 시 부드러운 crossfade 전환
- `prefers-reduced-motion` 존중
- 브라우저 미지원 시 graceful fallback

### 3-2. 코드 블록 파일명/언어 표시
- rehype-pretty-code의 meta string 활용 (예: ```ts title="utils.ts")
- 코드 블록 상단에 파일명 또는 언어 레이블 표시
- 기존 CodeBlockCopy 컴포넌트와 통합
- 테마별 스타일 적용

### 3-3. 프린트 스타일시트
- `@media print` 규칙 추가
- 헤더/푸터/사이드바/댓글/구독CTA 숨김
- 본문 최적화 (흑백, 적절한 여백, 링크 URL 표시)
- 코드 블록 배경 제거, 줄바꿈 처리

---

## Batch 4 — 발견성

### 4-1. 인기 글 표시
- Supabase view_count 기반 인기글 조회
- 홈페이지 또는 사이드바에 "인기 글 TOP 5" 섹션
- 캐싱 전략 필요 (ISR 또는 정적 + 클라이언트 fetch)

### 4-2. 검색 필터 강화
- 기존 Fuse.js 검색에 태그 필터 추가
- 검색 모달에 태그 칩 토글 UI
- 태그 선택 시 해당 태그 포스트만 검색 대상
