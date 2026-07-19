# VIMO User App

VIMO의 유저용 Expo 애플리케이션입니다. 로그인 이후의 유저 전용 화면은 이 패키지에 구현합니다.

## 실행

```powershell
npm.cmd ci
npx.cmd expo start
```

웹은 다음 명령으로 실행합니다.

```powershell
npx.cmd expo start --web --port 8082
```

## 검증

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
```

## 환경 변수

- `EXPO_PUBLIC_API_BASE_URL`: 백엔드 API 주소
- `EXPO_PUBLIC_USE_MOCK_AUTH=true`: mock 로그인 강제 사용

API 주소가 없거나 mock 인증이 활성화된 경우 `1111` / `1111` 계정으로 로그인할 수 있습니다.

공통 진입·로그인 UI는 루트의 `shared` 패키지에 있으며, API·저장소·라우팅은 유저 앱에서 callback으로 주입합니다.
