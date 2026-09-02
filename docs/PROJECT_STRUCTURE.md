# VIMO Frontend Project Structure

VIMO는 Expo Router 기반의 **단일 Expo 앱**입니다. 유저 화면과 관리자 화면은 하나의 앱 안에 있지만, 라우트와 코드는 역할·기능별로 분리합니다.

`src/`는 **"타입(역할) → 기능"** 2단계 구조입니다. 즉 먼저 `screens / components / services / hooks / types / utils / styles`처럼 **코드의 역할**로 나누고, 그 안을 다시 `common / exploration / join / certification / mypage / auth / onboarding / admin`처럼 **기능 도메인**으로 나눕니다.

## Root

```txt
vimo_frontend/
├─ app/      # Expo Router 라우트 전용 (URL = 파일 경로)
├─ src/      # 실제 화면·컴포넌트·로직
├─ assets/   # 이미지/아이콘/폰트
├─ docs/
├─ package.json
├─ app.json
└─ tsconfig.json
```

## Routing (`app/`)

`app/`은 **라우팅 전용**입니다. 화면 구현은 두지 않고, `src/screens`의 화면을 얇게 연결(re-export)하거나 `_layout.tsx`만 둡니다.

```txt
app/
├─ _layout.tsx
├─ (user)/          # 유저 라우트 그룹 (URL에 user 안 붙음)
│  ├─ _layout.tsx
│  ├─ index.tsx     →  @/screens/auth/EntryScreen
│  ├─ my-page.tsx   →  @/screens/mypage
│  └─ ...
└─ admin/           # 관리자 라우트 그룹
   ├─ _layout.tsx
   ├─ (tabs)/
   └─ posting/, qr/, activity/
```

- 라우트 파일 예시: `export { default } from '@/screens/admin/PostingsScreen';`
- `_layout.tsx`(라우팅 설정)만 예외적으로 `app/`에 구현을 둡니다.

## Source Code (`src/`)

```txt
src/
├─ screens/       # 화면 컴포넌트 (app/ 라우트가 연결하는 대상)
│  ├─ exploration/ join/ certification/ mypage/ auth/ onboarding/ admin/
├─ components/    # 재사용 UI 컴포넌트
│  ├─ common/     # 유저·관리자 공용 (Button, Tag, MenuSection, StatusBadge ...)
│  ├─ exploration/ join/ auth/ admin/ calendar/ navigation/
├─ services/      # API 클라이언트 · 서버 통신 · 상태 store
│  ├─ common/     # client, auth, auth-storage, volunteers, user-setup
│  ├─ exploration/ join/ admin/
├─ hooks/         # 재사용 훅
│  ├─ common/ admin/
├─ types/         # 공유 타입
│  ├─ common/ exploration/ join/ admin/
├─ utils/         # 순수 유틸 함수
│  └─ join/
└─ styles/        # 테마·디자인 토큰
   └─ admin/
```

### 각 폴더의 역할

- `screens`: 한 화면 전체를 그리는 컴포넌트. `app/` 라우트가 이걸 연결합니다.
- `components`: 화면 안에서 재사용하는 UI 조각. **유저·관리자가 공통으로 쓰는 건 `components/common`.**
- `services`: API 호출, 서버 통신 래퍼, 클라이언트 상태 store(예: `volunteer-interaction-store`).
- `hooks` / `types` / `utils` / `styles`: 이름 그대로. 공용이면 `common`, 특정 기능 전용이면 해당 기능 폴더에 둡니다.

## Naming Convention

| 종류 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트·화면 파일 | **PascalCase** | `Button.tsx`, `MyPageScreen.tsx`, `ActivityCard.tsx` |
| 그 외 파일 (services/types/utils/styles) | **kebab-case** | `auth-storage.ts`, `application-status-types.ts` |
| 훅 파일 | `use-` kebab-case | `use-admin-auth.tsx` |

## Import Rules

- 다른 폴더의 코드는 항상 `@/` 절대경로로 가져옵니다. 예: `import { Button } from '@/components/common';`
- 같은 폴더 안의 형제 파일만 상대경로(`./`, `../`)를 씁니다.
- 에셋은 `@/assets/...` alias로 가져옵니다. 예: `require('@/assets/images/mypageimg/basicprofile.png')`

## Rules

1. `app/`에는 라우트 파일과 `_layout.tsx`만 둡니다. 화면 구현은 `src/screens/*`.
2. 코드는 먼저 **역할**(screens/components/services/...), 그 다음 **기능**으로 분류합니다.
3. **유저·관리자가 같은 결과를 렌더링하는 코드만** `components/common` 등으로 공유합니다. 결과가 다르면 억지로 합치지 않습니다.
4. 특정 기능 전용 코드는 해당 기능 폴더(`.../exploration`, `.../admin` 등)에 둡니다.
5. 목업 데이터는 API 전환 이후 기본 실행 경로에 남기지 않습니다.
