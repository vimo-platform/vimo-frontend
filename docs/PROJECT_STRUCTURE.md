# VIMO Frontend Project Structure

VIMO는 Expo Router 기반의 단일 Expo 앱입니다. 유저 화면과 관리자 화면은 하나의 앱 안에 있지만, 라우트와 기능 코드는 역할별로 분리합니다.

## Root

```txt
vimo_frontend/
├─ app/
├─ src/
├─ assets/
├─ docs/
├─ package.json
├─ app.json
├─ tsconfig.json
└─ metro.config.js
```

## Routing

`app/`은 Expo Router 라우트 전용 폴더입니다. 화면 구현 로직이나 공통 컴포넌트는 이곳에 두지 않습니다.

```txt
app/
├─ _layout.tsx
├─ (user)/
└─ admin/
```

- `app/(user)`: 유저용 라우트 그룹입니다. 괄호가 있으므로 URL/deep link 경로에 `user`가 붙지 않습니다.
- `app/admin`: 관리자용 라우트 그룹입니다.
- 라우트 파일은 각 feature screen을 얇게 연결하는 역할만 맡습니다.

## Source Code

```txt
src/
├─ api/
├─ components/
├─ features/
├─ hooks/
├─ storage/
└─ types/
```

- `src/api`: 여러 기능에서 공유하는 API 클라이언트와 API 래퍼를 둡니다.
- `src/components`: 여러 기능에서 재사용하는 공통 UI만 둡니다.
- `src/features`: 실제 화면과 기능별 로직을 둡니다.
- `src/hooks`: 앱 전역에서 재사용하는 훅을 둡니다.
- `src/storage`: 토큰, 로그인 유저 정보 같은 로컬 저장소 코드를 둡니다.
- `src/types`: 여러 기능에서 공유하는 타입을 둡니다.

## Features

```txt
src/features/
├─ auth/
├─ exploration/
├─ join/
├─ certification/
├─ mypage/
└─ admin/
```

- 유저 기능은 `exploration`, `join`, `certification`, `mypage`로 나눕니다.
- 관리자 기능은 `admin` 아래에 모읍니다.
- 특정 기능에서만 쓰는 컴포넌트/API/타입은 해당 feature 내부에 둡니다.
- 두 기능 이상에서 쓰이면 `src/components`, `src/api`, `src/types`로 올립니다.

## Assets

```txt
assets/
├─ icons/
├─ images/
└─ admin/
```

- `assets/icons`: 앱 공통 아이콘을 둡니다.
- `assets/images`: 유저 화면 중심의 이미지 에셋을 둡니다.
- `assets/admin`: 관리자 화면 전용 에셋을 둡니다.
- 사용하지 않는 Expo 예제 이미지와 백업용 에셋은 보관하지 않습니다.

## Rules

1. `app/`에는 라우트 파일과 `_layout.tsx`만 둡니다.
2. 화면 구현은 `src/features/*`에 둡니다.
3. 기능 전용 코드는 해당 feature 내부에 둡니다.
4. 공통 코드는 `src/components`, `src/api`, `src/types`, `src/hooks`로 분리합니다.
5. 목업 데이터는 API 전환 이후 기본 실행 경로에 남기지 않습니다.
6. 보존용 앱 폴더는 루트 앱 실행에 필요하지 않으므로 유지하지 않습니다.
