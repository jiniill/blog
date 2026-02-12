# Code Readability Convention

> **Audience:** AI code generators only.
> **Enforcement level:** MUST = violation is a defect. SHOULD = follow unless you can state a concrete reason not to.
> **Comment language:** All inline comments and chapter headings in generated code MUST be written in **Korean**. This document's examples use Korean comments to demonstrate the expected output.

---

## Pre-Output Checklist

Before delivering any code, verify every item below. Do not skip.

- [ ] Every function >15 lines has chapter-heading comments (Korean) splitting semantic blocks
- [ ] Functions ≤15 lines do NOT have chapter-heading comments
- [ ] Every magic number in conditions AND return values has a Why comment (Korean)
- [ ] No function does more than its name promises
- [ ] Public entry points read as a scenario outline — one abstraction level only
- [ ] No single function exceeds ~40 lines without attempting extraction (R1 over R10-A)
- [ ] Happy path is reachable without mentally unwinding nested conditions
- [ ] Similar operations use the same structural pattern
- [ ] All inline comments are in Korean

---

## Rules

### R1. Single Abstraction Level per Function

**MUST.** A public/entry-point function operates at exactly one abstraction level — it reads as a scenario outline. Detail goes in sub-methods.

**Quantitative trigger:** If a block inside a function exceeds **15 lines** or introduces a different concern (validation vs. persistence vs. notification), extract it.

**Priority over R10-A:** When a function exceeds **~40 lines**, extraction (R1) takes priority over chapter headings (R10-A). Chapter headings help navigate a long function, but they do not justify keeping an oversized function intact. If a chapter-headed block is independently meaningful and >15 lines, extract it into its own method.

**Do NOT extract** when the candidate method would be ≤3 lines, used once, and its name adds no meaning beyond what the code already says.

```php
// GOOD — 시나리오 수준만 노출
public function processBooking(Booking $booking): void
{
    $this->validate($booking);

    $booking->total_price  = $this->calculatePrice($booking);
    $booking->status       = 'confirmed';
    $booking->confirmed_at = now();
    $booking->save();

    $this->notifyParties($booking);
    event(new BookingConfirmed($booking));
}
```

```php
// BAD — 검증, 가격 계산, 저장, 알림이 한 함수에 같은 깊이로 혼재
public function processBooking(Booking $booking): void
{
    if ($booking->date < now()) { throw ...; }
    if ($booking->venue->capacity < $booking->expectedGuests) { throw ...; }
    $overlapping = Booking::where(...)->exists();
    if ($overlapping) { throw ...; }

    $basePrice = $booking->venue->hourlyRate * $booking->hours;
    $weekendMultiplier = in_array(...) ? 1.5 : 1.0;
    // ... 20줄 이상의 가격 계산 + 저장 + 알림 코드
}
```

---

### R2. Guard Clauses First

**MUST.** Reject invalid states at the top via early return/throw. Everything past the guards = happy path. No else-after-return.

The reader should never need to mentally track "which branch am I in?" beyond the first few lines. Guard clauses act as a filter — once you pass them, you can trust the remaining code operates on valid state.

**Quantitative trigger:** If nesting depth exceeds **2 levels** due to validation checks, convert to guard clauses.

```php
// GOOD — 가드 절 통과 후 = 정상 흐름
if (!$chatRoom) {
    return ['success' => false, 'status' => 404, 'message' => '채팅방을 찾을 수 없습니다.'];
}
if (!$this->isParticipant($userId, $roomId)) {
    return ['success' => false, 'status' => 403, 'message' => '접근 권한이 없습니다.'];
}
// 이후 depth 0에서 정상 로직 진행
```

```php
// BAD — 정상 흐름이 중첩 3단계 안에 묻힘
if ($chatRoom) {
    if ($this->isParticipant($userId, $roomId)) {
        if ($order) {
            // ... 여기서야 비로소 실제 로직
        }
    }
}
```

---

### R3. Declare Variables Close to Usage

**SHOULD.** Declare a variable immediately before the block that uses it — not at the top of the function. This eliminates "what was this again?" scrolling.

If the same variable is needed in **multiple distant blocks**, declare it once at the earliest point and add a one-line comment explaining the early placement.

Never duplicate a query by re-declaring the same data in two places.

```php
// BAD — 모든 쿼리를 상단에 몰아놓고, $reviews는 30줄 뒤에서 사용
$performances = Performance::where('artist_id', $artistId)->get();
$settlements = Settlement::where('artist_id', $artistId)->get();
$reviews = Review::whereIn('performance_id', $performances->pluck('id'))->get();

// ... 30줄간 $performances 처리 ...
// ... 여기서 $reviews 사용 — 선언부까지 스크롤 필요
```

```php
// GOOD — 각 쿼리를 사용 직전에 배치
// 공연 요약
$performances = Performance::where('artist_id', $artistId)->get();
$totalShows = $performances->count();

// 정산 요약
$settlements = Settlement::where('artist_id', $artistId)->get();
$totalRevenue = $settlements->sum('revenue');

// 리뷰 요약 — $performances에 의존하므로 그 뒤에 배치
$reviews = Review::whereIn('performance_id', $performances->pluck('id'))->get();
$avgScore = $reviews->avg('score');
```

---

### R4. Blank Lines as Paragraph Breaks

**MUST.** Insert a blank line between every semantic unit. A semantic unit is a group of lines that serve one purpose (filter, transform, build payload, etc.).

Code without blank lines reads like a wall of text — every line carries equal visual weight and the reader can't skim for structure.

**Quantitative trigger:** Any unbroken block of **>8 lines** without a blank line needs splitting.

```php
// BAD — 하나의 연속 블록
$events = $rawEvents->filter(fn ($e) => $e->status !== 'cancelled');
$mapped = $events->map(fn ($e) => [...]);
$sorted = $mapped->sortBy('starts_at');
$grouped = ['upcoming' => [], 'past' => []];
foreach ($sorted as $event) {
    $event->isPast ? $grouped['past'][] = $event : $grouped['upcoming'][] = $event;
}
return $grouped;
```

```php
// GOOD — 의미 단위별 빈 줄 + 챕터 헤딩
// 취소된 이벤트 제외
$events = $rawEvents->filter(fn ($e) => $e->status !== 'cancelled');

// API 응답 → UI 모델 변환
$mapped = $events->map(fn ($e) => [...]);

// 시간순 정렬 후 과거/예정 분리
$sorted = $mapped->sortBy('starts_at');

$grouped = ['upcoming' => [], 'past' => []];
foreach ($sorted as $event) {
    $event->isPast ? $grouped['past'][] = $event : $grouped['upcoming'][] = $event;
}

return $grouped;
```

---

### R5. Name Complex Conditions

**MUST** when 3+ conditions are ANDed/ORed. Extract to a named predicate method or boolean variable.

The goal is progressive disclosure — the calling code reads as a sentence ("if eligible for payout, execute transfer"), and the reader drills into the predicate only if they need the details.

**Do NOT extract** when there are only 1–2 simple clauses.

```php
// BAD — 4개 조건이 인라인으로 나열
if ($status === 'active' && $contract->signed && $bank->verified && $amount > 0) {

// GOOD — 의미 있는 이름으로 추출
if ($this->isEligibleForPayout($artist, $settlement)) {
```

**Depth limit:** Named predicates should not chain more than **2 levels** deep. `isEligibleForPayout` → `hasSignedContract` → `hasDocumentOfType` is already 3 levels. Sometimes a flat list of readable conditions beats a chain of delegations.

---

### R6. Intermediate Variables for Multi-Step Expressions

**SHOULD.** When an expression combines **3+ operations**, break it into named intermediates. The variable names become the explanation — the final line should read like a formula.

Do NOT introduce a variable when it merely aliases a single value (`$sum = $a + $b; return $sum;`).

```php
// BAD — 5개 연산이 한 줄에 압축
$total = (int) floor($supplyAmount * (1 + $platformRate) * (1 + $vatRate) * (1 + $pgRate));

// GOOD — 변수명이 곧 비즈니스 룰 설명
// 수수료 계산 순서: 플랫폼 → 부가세 → PG (각 단계가 이전 단계 결과에 누적)
$baseWithPlatform = (int) round($supplyAmount * (1 + $platformRate));
$vat              = (int) round($baseWithPlatform * $vatRate);
$subtotal         = $baseWithPlatform + $vat;
$pgFee            = (int) round($subtotal * $pgRate);
$total            = $subtotal + $pgFee;
```

---

### R7. Chronological / Causal Ordering

**MUST.** Code order must match logical execution order. When the reader sees step B, they should be able to trust that step A already happened.

Canonical side-effect order:

```
1. Validate           — 잘못된 상태 조기 거부
2. Core state change  — 핵심 쓰기 (DB 저장, 상태 변경)
   └─ 여러 쓰기가 원자적이어야 하면 트랜잭션으로 감싸기
3. Derived data       — 캐시 무효화, 집계 갱신
4. External effects   — 이벤트 발행, 알림, 웹훅, 큐 작업
```

Step 4 fires **after commit** — if the DB write fails, no event should be dispatched.

```php
// BAD — 캐시 플러시와 정산 생성이 상태 저장보다 먼저 실행
Cache::tags([...])->flush();
$this->settlementService->createFromPerformance($performance);
$performance->status = 'completed';
$performance->save();
event(new PerformanceCompleted($performance));

// GOOD — 상태 변경 → 파생 데이터 → 외부 효과
// 1. 상태 변경
$performance->status = 'completed';
$performance->completed_at = now();
$performance->save();

// 2. 파생 데이터
Cache::tags(['artist-stats', "artist-{$performance->artist_id}"])->flush();
$this->settlementService->createFromPerformance($performance);

// 3. 외부 알림
event(new PerformanceCompleted($performance));
```

---

### R8. No Hidden Side Effects

**MUST.** A function must not do more than its name promises.

- Read-only → name says `get` / `load` / `find` / `resolve` / `calculate`
- Mutation → name says `update` / `attach` / `apply` / `save`
- Both → name MUST reflect both (e.g., `fetchAndMarkAsRead`), plus a Why comment explaining why they're coupled.

```php
// BAD — 이름은 "URL 첨부"인데 실제로는 DB 조회 + Order 모델 변경 + URL 반환
private function attachLatestReceiptUrl(Order $order): ?string

// GOOD (옵션 A) — 분리
private function loadLatestReceiptUrl(int $orderId): ?string
// 호출부에서: $order->setAttribute('receipt_url', $url);

// GOOD (옵션 B) — 결합 유지하되 이름과 Why 주석으로 명시
// Why: 호출부에서 URL과 Order 속성 세팅을 동시에 필요로 하며,
//      분리하면 동일 쿼리가 2회 발생함
private function loadAndAttachReceiptUrl(Order $order): ?string
```

---

### R9. Structural Symmetry

**SHOULD.** Functions that do analogous work must use the same:
- Argument types (all accept model vs. all accept ID — pick one)
- Save strategy (`$model->save()` vs. `$model->update([...])` — pick one)
- Return shape
- Dispatch style (`event(new ...)` vs. `Event::dispatch(...)` — pick one)

When the structural difference doesn't reflect a real behavioral difference, it's noise.

```php
// BAD — 같은 패턴(상태 변경 → 이벤트 → 로그)인데 형태가 다름
public function activate(Artist $artist): void
{
    $artist->status = 'active';
    $artist->save();
    event(new ArtistActivated($artist));
    Log::info("Artist activated: {$artist->id}");          // 문자열 보간
}

public function deactivate(int $artistId, string $reason): void  // 인자 타입 불일치
{
    $found = Artist::where('id', $artistId)->first();             // 조회 방식 불일치
    $found->update(['status' => 'inactive', ...]);                // 저장 방식 불일치
    ArtistDeactivated::dispatch($found);                          // 이벤트 발행 방식 불일치
    Log::warning("Artist deactivated", [...]);                    // 로그 레벨 불일치
}

// GOOD — 같은 패턴에는 같은 형태. 진짜 차이점($reason)만 드러남
public function activate(Artist $artist): void
{
    $artist->status = 'active';
    $artist->activated_at = now();
    $artist->save();

    event(new ArtistActivated($artist));
    Log::info('아티스트 활성화', ['id' => $artist->id]);
}

public function deactivate(Artist $artist, string $reason): void
{
    $artist->status = 'inactive';
    $artist->deactivated_at = now();
    $artist->deactivation_reason = $reason;
    $artist->save();

    event(new ArtistDeactivated($artist));
    Log::info('아티스트 비활성화', ['id' => $artist->id, 'reason' => $reason]);
}
```

---

### R10. Comments — Mandatory Chapter Headings and Why Notes

This is the most frequently violated rule. Follow it rigorously.
**All comments MUST be in Korean.**

#### R10-A. Chapter Headings — MUST

Every function **>15 lines** MUST have one-line heading comments that divide it into semantic blocks. A reader skimming only the comments must be able to reconstruct the function's purpose.

**Do NOT add chapter headings to functions ≤15 lines.** Short functions are self-explanatory — headings on them are noise. If a function is short enough to read in one glance, it needs no structural markers.

```php
private function buildCalendarPayload(int $roomId, ?Project $project, ?Program $program): array
{
    // 캘린더 이벤트 원본 조회
    $eventModels = CalendarEvent::where('chat_room_id', $roomId)->get();
    if ($eventModels->isEmpty()) {
        return $this->emptyCalendarPayload($project, $program);
    }

    // 각 이벤트를 일정 + 장소 데이터로 파싱
    $schedules = collect();
    $locationLabels = collect();
    foreach ($eventModels as $event) {
        $parsed = $this->parseCalendarEvent($event, $typeLineMap, $typeLabelMap);
        $schedules->push($parsed['schedule']);
        $locationLabels->push($parsed['location_label']);
    }

    // 통합 장소 페이로드 조립
    $locationPayload = $this->buildLocationPayload($sharedLocationLabel, $sharedLocationData);

    // 최종 응답 구성
    return [
        'models'     => $eventModels,
        'schedules'  => $trimmedSchedules,
        ...
    ];
}
```

**Self-test:** Remove all code, keep only comments. If the story is incoherent → add/rewrite.

#### R10-B. Why Comments — MUST

Attach a Why comment whenever any of the following appear:

| Trigger | Example |
|---------|---------|
| Magic number in a condition or return value (except 0, 1, -1 in loops/indices) | `if ($programStatus >= 5)` → `// 5 = 공연완료 (OrderStatus 기준)` · `return 3;` → `// 3 = 공연완료 (InquiryStatus)` |
| Intentional truncation/rounding | `(int) floor(...)` → `// 반올림 아닌 내림 — 구매자 유리 정책` |
| Counter-intuitive logic | 목록에서 1건만 유지 → `// 날짜별 요약 카드에는 가장 이른 event_time 1건만 표시` |
| Duplicate attributes | `receipt_url` + `receiptUrl` → `// 레거시 프론트엔드는 camelCase, 신규는 snake_case 사용` |
| Empty catch / silent fallback | `catch (\Throwable) { ... }` → `// 파싱 실패 시 크래시 대신 원본 값 그대로 노출` |
| Business rule in code | 수수료 계산 → `// 플랫폼 수수료 → 부가세 → PG 수수료 순서로 누적 적용` |
| Config/env-dependent value | `config('fees.platform_rate')` → `// .env PLATFORM_RATE, 기본값 0.0` (when non-obvious) |

**Do NOT write:**
- Translation comments that restate what the code already says. This includes:
  - `// 주문 조회` above `Order::find(...)`
  - `// 진행 상태 코드: 완료` above `const PROGRESS_STATUS_COMPLETED = 1` — the constant name already says "completed"
  - Comments on constants/enums whose names are self-descriptive. Only comment when the **value** is non-obvious (e.g., `PROGRAM_STATUS_PAYMENT_COMPLETED = 3` deserves `// program_status 3 이상이면 결제 완료`)
- Changelog entries (use git)
- Commented-out code (use version control)

#### R10-C. Return-Array Structure Comments — SHOULD

When a function returns an associative array with **>8 keys**, group the keys with inline heading comments:

```php
return [
    // 식별 정보
    'id'   => $chatRoom->id,
    'role'  => $viewerRole,

    // 연관 엔티티
    'partner' => $partner,
    'program' => $program,
    'project' => $project,

    // 일정
    'calendarEvents'       => $calendarPayload['schedules']->all(),
    'calendarEventsByDate' => $calendarPayload['grouped_by_date'],
    'calendarLocation'     => $calendarPayload['location_payload'],

    // 결제
    'paymentSummary'  => $paymentSummary,
    'payment_status'  => $this->resolvePaymentStatus($order),
    'latest_quote'    => $latestQuote,

    // 진행 상태 및 액션
    'progress_steps'        => $progressSteps,
    'progress_step_current' => $currentProgressStep,
    'next_actions'          => $nextActions,
];
```

---

## Quick Reference

| # | Rule | Level | Quantitative Trigger |
|---|------|-------|---------------------|
| R1 | Single abstraction level | MUST | Block >15 lines → extract; function >~40 lines → extraction over R10-A |
| R2 | Guard clauses first | MUST | Nesting >2 levels from validation → flatten |
| R3 | Variables close to usage | SHOULD | — |
| R4 | Blank-line paragraphs | MUST | Unbroken block >8 lines → split |
| R5 | Name complex conditions | MUST | ≥3 conditions → extract predicate |
| R6 | Intermediate variables | SHOULD | ≥3 operations in one expression |
| R7 | Chronological ordering | MUST | validate → state → derived → external |
| R8 | No hidden side effects | MUST | Name must match all behaviors |
| R9 | Structural symmetry | SHOULD | Similar functions → same shape |
| R10-A | Chapter headings (Korean) | MUST | Function >15 lines; do NOT add for ≤15 lines |
| R10-B | Why comments (Korean) | MUST | See trigger table (conditions + return values) |
| R10-C | Return-array grouping (Korean) | SHOULD | >8 keys in associative array |
