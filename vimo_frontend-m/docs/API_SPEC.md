# VIMO 조교용 앱 — 백엔드 API 명세서

> 대학 봉사활동 행정 자동화 앱(조교/관리자용)의 프론트엔드가 요청할 API 목록입니다.
> 프론트엔드는 현재 mock으로 동작 중이며, 아래 응답 형태(JSON)에 맞춰 서버가 응답하면 프론트 수정 없이 연동됩니다.
> 데이터 타입 원본: `src/types/index.ts`

---

## 0. 공통 규약

### Base URL
```
https://api.vimo.example.com/v1
```

### 인증
- 조교(관리자) 로그인 후 발급받은 토큰을 모든 요청 헤더에 포함합니다.
```
Authorization: Bearer {accessToken}
```

### 공통 헤더
```
Content-Type: application/json
```

### 날짜/시간 표기
| 항목 | 형식 | 예시 |
|---|---|---|
| 날짜 (쿼리 등) | `YYYY-MM-DD` | `2026-07-21` |
| 시각 (시:분) | `HH:mm` | `11:30` |
| 기간(사람이 읽는 문자열) | 자유 문자열 | `2026.03.13 ~ 2026.06.19 (매주 금요일)` |
| 타임스탬프 | ISO 8601 | `2026-07-20T13:37:00+09:00` |

> ⚠️ `period`는 화면에 그대로 표시되는 **문자열**입니다(파싱하지 않음). 시작/종료 시각은 `startTime`/`endTime`으로 별도 관리합니다.

### 에러 응답 (공통)
HTTP 상태코드 + 아래 형식으로 통일합니다.
```json
{
  "error": {
    "code": "POSTING_NOT_FOUND",
    "message": "해당 공고를 찾을 수 없습니다."
  }
}
```
| 상황 | HTTP |
|---|---|
| 잘못된 요청(유효성 실패) | 400 |
| 인증 실패 | 401 |
| 권한 없음 | 403 |
| 리소스 없음 | 404 |
| 서버 오류 | 500 |

---

## 1. 데이터 모델

### Posting (공고)
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 공고 ID |
| `title` | string | 공고 제목 |
| `description` | string | 모집 안내 본문 (개행 `\n` 포함 가능) |
| `location` | string | 활동 장소 |
| `period` | string | 활동 기간(표시용 문자열) |
| `startTime` | string | 시작 시각 `HH:mm` |
| `endTime` | string | 종료 시각 `HH:mm` |
| `capacity` | number | 모집 인원(정원) |
| `applicants` | number | 현재 지원 인원 |
| `hoursPerSession` | number | 회차당 인정 봉사시간 |
| `status` | `"open"` \| `"closed"` \| `"draft"` | 모집중 / 마감 / 임시저장 |
| `recruitType` | `"selection"` \| `"fcfs"` | 선발 모집 / 선착순 모집 |
| `tags` | string[] | 키워드 태그 |
| `gender` | `"전체"` \| `"남성"` \| `"여성"` | 모집 성별(선택) |
| `createdAt` | string | 생성일 `YYYY-MM-DD` |

### Session (현장 세션)
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 세션 ID |
| `postingId` | string | 연결된 공고 ID |
| `title` | string | 공고 제목 |
| `hoursPerSession` | number | 회차당 인정 시간 |
| `location` / `period` / `startTime` / `endTime` | string | 공고와 동일 |
| `status` | `"before"` \| `"ongoing"` \| `"done"` | 시작 전 / 진행중 / 종료 |

### Applicant (지원자)
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 지원자 ID |
| `name` | string | 이름 |
| `department` | string | 학과 |
| `selected` | boolean | 채택 여부(선발) / 참여확정 여부(선착순) |
| `cancel` | object \| null | 지원 취소한 학생만 존재. `{ at: string, reason: string }` |

### Approval (승인 건)
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 승인 건 ID |
| `postingTitle` | string | 공고 제목 |
| `hoursPerSession` | number | 회차당 인정 시간 |
| `location` / `period` / `startTime` / `endTime` | string | 활동 정보 |
| `studentName` | string | 학생 이름 |
| `status` | `"pending"` \| `"approved"` \| `"rejected"` | 대기 / 승인완료 / 반려 |

---

## 2. 공고 (Postings)

### 2-1. 내 공고 목록 조회
화면: 공고 탭 메인 (전체 / 모집중 / 모집마감 / 임시저장 필터)

```
GET /postings
```
**쿼리 파라미터 (선택)**
| 이름 | 값 | 설명 |
|---|---|---|
| `status` | `open` \| `closed` \| `draft` | 미지정 시 전체 |

**응답 200**
```json
[
  {
    "id": "p1",
    "title": "학술제 안내요원 모집",
    "description": "학술제 행사장 안내 및 보조 업무를 담당할 봉사자를 모집합니다.",
    "location": "샬롬관 807호",
    "period": "2026.03.13 ~ 2026.06.19 (매주 금요일)",
    "startTime": "11:30",
    "endTime": "16:30",
    "capacity": 7,
    "applicants": 8,
    "hoursPerSession": 3,
    "status": "open",
    "recruitType": "selection",
    "tags": ["학술제 안내 및 보조"],
    "createdAt": "2026-07-05"
  }
]
```
> 정렬: 최신 생성순(`createdAt` 내림차순).

---

### 2-2. 공고 상세 조회
화면: 공고 카드 → 상세

```
GET /postings/{id}
```
**응답 200** — `Posting` 단건 (위 2-1의 요소와 동일)
**응답 404** — 공고 없음

---

### 2-3. AI 공고 생성 ⭐ 핵심 기능
화면: 공고 작성 → 메모 입력 → "AI 공고 생성" → 로딩 → 생성 결과

조교가 입력한 간단한 메모를 서버(LLM)가 정돈된 공고 문안으로 변환합니다.

```
POST /postings/ai-draft
```
**요청**
```json
{
  "memo": "장애 학우 도우미 모집합니다. 수업 보조. 취소 불가"
}
```
**응답 200**
```json
{
  "title": "장애학우 수업 도우미 모집",
  "description": "장애학우의 안정적인 수업 참여를 지원하기 위한 수업 도우미를 모집합니다.\n\n전문적인 활동 경험이 없어도 참여 가능하며, 책임감 있게 활동 가능한 재학생의 많은 지원 바랍니다.",
  "keywords": ["매주 금요일 정기 참여 가능자 우대", "강의실 이동 및 착석 보조"]
}
```
> 응답의 `keywords`는 프론트에서 `Posting.tags`로 사용됩니다.
> 처리에 수 초 걸릴 수 있음(프론트에 로딩 화면 존재).

---

### 2-4. 공고 등록 / 임시저장
화면: 공고 생성 완료 → "이대로 공고 등록" → "등록" (또는 임시저장)

```
POST /postings
```
**요청** (id 없이 전송, 서버가 발급)
```json
{
  "title": "장애학우 수업 도우미 모집",
  "description": "장애학우의 안정적인 수업 참여를 지원하기 위한 수업 도우미를 모집합니다.",
  "location": "샬롬관 807호",
  "period": "2026.03.13 ~ 2026.06.19 (매주 금요일)",
  "startTime": "11:30",
  "endTime": "16:30",
  "capacity": 3,
  "hoursPerSession": 3,
  "recruitType": "selection",
  "tags": ["매주 금요일 정기 참여 가능자 우대", "강의실 이동 및 착석 보조"],
  "gender": "전체",
  "status": "open"
}
```
> `status: "draft"`로 보내면 **임시저장**, `"open"`이면 **정식 등록**.

**응답 201** — 생성된 `Posting` 전체 (서버가 부여한 `id`, `createdAt`, `applicants: 0` 포함)

---

### 2-5. 공고 수정
화면: 임시저장 카드 → "수정" → 공고 수정 폼

```
PUT /postings/{id}
```
**요청** — 2-4와 동일한 바디(전체 필드)
**응답 200** — 수정된 `Posting`
**응답 404** — 공고 없음

> ⚠️ 정식 등록된(`open`) 공고는 "수정할 수 없어요" 정책이 있으므로, 서버에서도 `draft` 상태만 수정 허용을 권장합니다. (등록 확정 시 수정 불가)

---

### 2-6. 모집 마감
화면: 지원자 목록 → "모집 마감" 버튼

```
PATCH /postings/{id}/close
```
**요청** 바디 없음
**응답 200**
```json
{ "id": "p1", "status": "closed" }
```

---

## 3. 지원자 (Applicants)

### 3-1. 지원자 목록 조회
화면: 지원자 목록 (선발 모집 / 선착순 모집)

```
GET /postings/{postingId}/applicants
```
**쿼리 파라미터 (선택)**
| 이름 | 값 | 설명 |
|---|---|---|
| `type` | `selection` \| `fcfs` | 공고의 모집 방식. 선착순이면 지원 순서대로 반환 |

**응답 200**
```json
[
  { "id": "a1", "name": "김강대", "department": "사회복지학과", "selected": true },
  {
    "id": "a2",
    "name": "김강대",
    "department": "사회복지학과",
    "selected": false,
    "cancel": {
      "at": "2026-07-20T13:37:00+09:00",
      "reason": "개인 일정으로 인해 참여가 어려워 취소합니다.\n죄송합니다."
    }
  }
]
```
> - `selected: true` = 채택됨(선발) / 참여확정(선착순)
> - `cancel` 필드가 있으면 지원 취소한 학생 → 화면에서 "취소 사유 확인" 표시. 이 데이터로 취소 사유 모달을 그리므로 **별도 취소사유 API 불필요**.
> - 선착순 목록은 **지원한 순서대로** 정렬해서 반환.

---

### 3-2. 지원자 채택 / 채택 취소 (선발 모집)
화면: 지원자 목록 → "채택" 버튼 토글  *(신규 — 현재 mock에 없음)*

```
PATCH /applicants/{id}/select
```
**요청**
```json
{ "selected": true }
```
**응답 200**
```json
{ "id": "a1", "selected": true }
```

---

### 3-3. 참여 확정 (선착순 모집)
화면: 지원자 목록(선착순) → "참여확정"  *(신규 — 현재 mock에 없음)*

```
PATCH /applicants/{id}/confirm
```
**요청** 바디 없음
**응답 200**
```json
{ "id": "f1", "selected": true }
```
> 정원이 다 차면 공고가 자동 마감(`status: "closed"`)되도록 서버에서 처리 권장.

---

## 4. 현장 QR (Sessions)

### 4-1. 날짜별 세션 목록
화면: 현장 QR 탭 홈 (달력에서 날짜 선택 → 그날 세션 리스트)

```
GET /sessions?date=YYYY-MM-DD
```
**응답 200**
```json
[
  {
    "id": "s1",
    "postingId": "p1",
    "title": "장애학우 수업 도우미 모집",
    "hoursPerSession": 3,
    "location": "샬롬관 807호",
    "period": "2026.03.13 ~ 2026.06.19 (매주 금요일)",
    "startTime": "11:30",
    "endTime": "16:30",
    "status": "ongoing"
  }
]
```

---

### 4-2. QR 발급 (시작 / 종료) ⭐ 핵심 기능
화면: "시작 QR 생성" / "종료 QR 생성" / "QR 다시 생성"  *(신규 — 현재 mock에 없음)*

봉사생이 스캔할 QR을 서버가 발급합니다. 앱은 응답의 토큰/문자열을 QR 이미지로 렌더링만 합니다.

```
POST /sessions/{id}/qr
```
**요청**
```json
{ "type": "start" }
```
> `type`: `"start"`(활동 시작) 또는 `"end"`(활동 종료). "다시 생성"도 같은 요청(새 토큰 재발급).

**응답 200**
```json
{
  "sessionId": "s1",
  "type": "start",
  "qrToken": "eyJhbGciOi...서명된토큰",
  "expiresAt": "2026-07-21T12:00:00+09:00"
}
```
> 보안: 토큰에 만료시간 포함, 재생성 시 이전 토큰 무효화 권장.

---

### 4-3. (참고) QR 스캔 인증 수신 — 학생 앱용
> 조교 앱에는 화면이 없지만, 승인/학사연동의 근거가 되는 출결 데이터이므로 백엔드에 필요합니다.

```
POST /sessions/{id}/checkin
```
**요청**
```json
{ "qrToken": "eyJhbGciOi...", "studentId": "학생ID" }
```
**응답 200** — 출결 기록 결과 (`checkin`/`checkout` 시각 등)

---

## 5. 승인 / 반려 (Approvals)

### 5-1. 승인 목록 조회
화면: 승인 탭 (승인 대기 / 승인 완료 / 반려 필터)

```
GET /approvals
```
**쿼리 파라미터 (선택)**
| 이름 | 값 |
|---|---|
| `status` | `pending` \| `approved` \| `rejected` |

**응답 200**
```json
[
  {
    "id": "ap1",
    "postingTitle": "장애학우 수업 도우미 모집",
    "hoursPerSession": 3,
    "location": "샬롬관 807호",
    "period": "2026.03.13 ~ 2026.06.19 (매주 금요일)",
    "startTime": "11:30",
    "endTime": "16:30",
    "studentName": "김강대",
    "status": "pending"
  }
]
```

---

### 5-2. 승인 처리
화면: 승인 대기 카드 → "승인" (학사 시스템 자동 연동 진행)

```
PATCH /approvals/{id}
```
**요청**
```json
{ "status": "approved" }
```
**응답 200**
```json
{ "id": "ap1", "status": "approved" }
```
> 승인 시 서버가 봉사시간 계산 → 학사 DB 전송(1365/VMS 대체)까지 처리. 프론트에는 연동 진행 화면이 있으므로, 처리 완료를 응답으로 반환하면 됩니다.

---

### 5-3. 반려 처리
화면: 승인 대기 카드 → "반려" → 반려 사유 입력 → "반려"

```
PATCH /approvals/{id}
```
**요청**
```json
{ "status": "rejected", "reason": "활동 확인이 어렵습니다." }
```
**응답 200**
```json
{ "id": "ap1", "status": "rejected" }
```
> `reason`은 반려 시에만 전송(최대 100자).

---

## 6. 우선순위 요약 (백엔드 작업 순서 제안)

| 순위 | 엔드포인트 | 비고 |
|---|---|---|
| 🔴 1 | `POST /postings/ai-draft` | 앱 핵심(AI 공고 생성), LLM 연동 필요 |
| 🔴 1 | `POST /sessions/{id}/qr` + `POST /sessions/{id}/checkin` | 앱 핵심(QR 인증), 신규 |
| 🟠 2 | `GET/POST/PUT /postings`, `PATCH .../close` | 공고 CRUD |
| 🟠 2 | `GET /approvals`, `PATCH /approvals/{id}` | 승인/반려 + 학사연동 |
| 🟡 3 | `GET .../applicants`, `PATCH .../select`, `.../confirm` | 지원자 관리 |
| 🟡 3 | `GET /sessions` | 세션 목록 |

**범례**: 🔴 앱 차별화 핵심 · 🟠 기본 운영 필수 · 🟡 부가 관리

---

*이 문서의 데이터 타입은 프론트엔드 `src/types/index.ts`와 1:1 대응합니다. 필드명/타입을 그대로 맞춰 응답해 주시면 프론트 수정 없이 연동됩니다.*
