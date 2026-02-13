# Resend + Supabase 이메일 구독 기능

## Context

헤더에 비활성 Subscribe 버튼(`href="#"`)이 있는 상태에서, Resend(이메일 발송) + Supabase(구독자 저장) 조합으로 실제 구독 기능을 구현한다.
- **인증 방식**: Single opt-in (편의성 우선)
- **범위**: 구독자 수집 + 환영 이메일. 새 글 알림 발송은 이후 확장.
- **UI 위치**: 헤더 버튼 → 모달 + 블로그 글 하단 CTA

## 새로 생성하는 파일 (4개)

### 1. `lib/resend.ts` — Edge 호환 Resend 클라이언트 + 환영 이메일 템플릿
- Node SDK 대신 `fetch`로 `https://api.resend.com/emails` 직접 호출 (Edge Runtime 호환)
- `sendEmail({ from, to, subject, html, text })` 함수
- `getWelcomeEmail(unsubscribeToken)` — 인라인 HTML/text 환영 이메일 생성
- 환경변수: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`(선택, 없으면 `onboarding@resend.dev` 폴백)

### 2. `app/api/subscribe/route.ts` — 구독 신청 API
- `export const runtime = "edge"`
- 기존 `app/api/views/[slug]/route.ts` 패턴 재사용:
  - 이메일 정규식 검증
  - IP SHA-256 해싱 (Web Crypto API)
  - `globalThis.__subscribeRateLimiter` 기반 레이트 리미팅 (3회/분)
  - `getSupabaseClient()`로 DB 조작
- 플로우: 이메일 검증 → 레이트 리밋 → Supabase INSERT → Resend 환영 이메일 발송
- 중복 이메일: 409 Conflict (`error.code === "23505"`)
- 이메일 전송 실패: 로그만 남기고 구독은 성공 처리

### 3. `app/api/unsubscribe/route.ts` — 구독 취소 API
- `GET /api/unsubscribe?token=xxx`
- 토큰으로 구독자 조회 → `status='unsubscribed'` 업데이트
- 자체 완결형 HTML 응답 반환 (별도 페이지 불필요)
- 주의: `data.email`을 HTML에 삽입할 때 XSS 방지를 위해 이스케이프 처리

### 4. `components/subscribe/subscribe-modal.tsx` — 구독 모달
- SearchModal과 동일한 Phase 상태 머신 (`closed → opening → open → closing → closed`)
- `<dialog>` + `showModal()` + `onAnimationEnd`
- 상태: `idle → submitting → success | error`
- 성공 시 체크 아이콘 + "구독이 완료되었습니다!" → 3초 후 자동 닫기
- CSS: `.subscribe-dialog` (search-dialog와 동일 구조, 별도 클래스명)

## 수정하는 파일 (3개)

### 5. `components/layout/header.tsx` — Subscribe 버튼 → 모달 트리거
- 96~101행의 `<a href="#">Subscribe</a>` 제거
- `useState` + `SubscribeModal` 조합으로 교체 (SearchTrigger 패턴)
- 모바일 메뉴에도 Subscribe 버튼 추가

### 6. `app/blog/[slug]/page.tsx` — 글 하단 CTA 추가
- `</article>` 직후, `<PostNav>` 직전에 CTA 섹션 삽입
- 카드 형태: Mail 아이콘 + 제목 + 설명 + "뉴스레터 구독하기" 버튼
- 버튼 클릭 → `useState` + `SubscribeModal` 열기

### 7. `app/globals.css` — 구독 모달 애니메이션 추가
- `.subscribe-dialog` 스타일 (search-dialog와 동일 패턴)
- 별도 키프레임 (`subscribe-fade-in/out`, `subscribe-slide-in/out`, `subscribe-backdrop-in/out`)
- `prefers-reduced-motion` 접근성 지원

## Supabase 스키마 (수동 설정)

```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  unsubscribe_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  ip_hash TEXT
);

CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_token ON subscribers(unsubscribe_token);

-- RLS: anon key로 INSERT + 제한적 UPDATE 허용
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_subscribe" ON subscribers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_unsubscribe" ON subscribers FOR UPDATE TO anon
  USING (true) WITH CHECK (status = 'unsubscribed');
```

## 환경변수 (`.env.local` 추가)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=newsletter@yourdomain.com  # 선택
```

## 변경 불필요
- `lib/supabase.ts` — 기존 `getSupabaseClient()` 그대로 사용
- `lib/site-config.ts` — `siteConfig.url`만 참조
- npm 의존성 추가 없음 (`@supabase/supabase-js` 이미 설치됨)

## 검증
1. `yarn dev` → 헤더 Subscribe 클릭 → 모달 열림/닫힘 애니메이션 확인
2. 이메일 입력 후 구독 → Supabase `subscribers` 테이블 확인
3. 중복 이메일 → "이미 구독 중" 에러 메시지 확인
4. Resend 대시보드에서 환영 이메일 발송 확인
5. 환영 이메일 내 구독 취소 링크 클릭 → 취소 성공 페이지 확인
6. 블로그 글 하단 CTA → 모달 열기 → 동일 플로우 확인
7. 빠른 연타 시 레이트 리미팅 동작 확인
