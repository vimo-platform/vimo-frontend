# VIMO 프로젝트 처음 실행하기

**아래 순서대로 진행하세요. 명령어는 한 줄씩 실행합니다.**

| 항목 | 사용할 값 |
| --- | --- |
| GitHub 저장소 | [vimo-platform/vimo-frontend](https://github.com/vimo-platform/vimo-frontend) |
| 작업 브랜치 | **`appdev`** |
| 프로젝트 폴더 | `vimo-frontend` |
| Expo SDK | **58** (`package.json`의 `expo: ^58.0.0`) |
| 실행 방식 | PC에서 개발 서버 실행 → 휴대폰 Expo Go로 QR 스캔 |

## 1. PC에 기본 프로그램 설치하기

다음 프로그램을 설치하세요.

- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download) **24 LTS** — npm도 함께 설치됩니다. 24.x 중 **24.3.0 이상**을 사용하세요.

설치 후 VS Code를 완전히 종료했다가 다시 열고, 상단 **터미널 → 새 터미널**을 선택하세요.

```bash
git --version
node -v
npm -v
```

**확인:** 세 명령어 모두 버전이 출력되고, Node.js는 `v24.x.x`로 나와야 합니다.

## 2. VS Code에서 GitHub 프로젝트 가져오기

1. VS Code에서 명령 팔레트를 여세요.
   - Windows: `Ctrl + Shift + P`
   - Mac: `Cmd + Shift + P`
2. **`Git: Clone`**을 검색해 선택하세요.
3. 다음 주소를 붙여 넣고 Enter를 누르세요.

   ```text
   https://github.com/vimo-platform/vimo-frontend.git
   ```

4. 프로젝트를 저장할 상위 폴더를 선택하세요. 그 안에 `vimo-frontend` 폴더가 생성됩니다.
5. 복제가 끝나면 **열기 / Open**을 누르세요.
6. GitHub 로그인이 요청되면 본인 GitHub 계정으로 로그인하세요.

**확인:** VS Code 탐색기에서 `app`, `src`, `assets`, `package.json`이 보여야 합니다.

> 저장소 페이지가 열리지 않거나 복제 권한 오류가 나오면, 팀 담당자에게 GitHub 접근 권한을 요청하세요.

## 3. `main`에서 `appdev` 브랜치로 바꾸기

VS Code 상단 **터미널 → 새 터미널**을 열고 실행하세요. 이후 명령어도 모두 `package.json`이 있는 **프로젝트 최상위 폴더**에서 실행합니다.

```bash
git fetch origin
git switch appdev
git pull --ff-only origin appdev
git branch --show-current
```

**확인:** 마지막 결과가 **`appdev`**여야 합니다. VS Code 왼쪽 아래 브랜치 이름도 `appdev`로 표시됩니다.

`git switch appdev`를 실행하면 원격 `appdev`를 추적하는 로컬 브랜치가 만들어지고, 편집기 파일도 해당 브랜치 코드로 바뀝니다.

## 4. 프로젝트 라이브러리 설치하기

```bash
npm install
```

설치가 끝나 터미널에서 다음 명령어를 입력할 수 있을 때까지 기다리세요.

SDK 버전을 확인하세요.

```bash
node -p "require('./package.json').dependencies.expo"
```

**확인:** `^58.0.0`이 출력되어야 합니다.

기본 백엔드는 `https://api2.hwangs.site`로 설정되어 있어 **처음 실행할 때 별도 `.env` 파일을 만들 필요는 없습니다.** 로그인·시간표 분석 등 서버 기능은 백엔드가 정상 가동 중이어야 동작합니다.

## 5. PC에서 Expo 계정 로그인하기

1. [Expo 회원가입](https://expo.dev/signup)에서 본인 계정을 만드세요. 이미 계정이 있으면 다음으로 진행하세요.
2. VS Code 터미널에서 실행하세요.

   ```bash
   npx expo login
   ```

3. **본인 Expo 계정**의 이메일 또는 사용자 이름과 비밀번호를 입력하세요. 비밀번호는 입력해도 화면에 표시되지 않을 수 있습니다.
4. 로그인된 계정을 확인하세요.

   ```bash
   npx expo whoami
   ```

**확인:** 본인의 Expo 사용자 이름이 출력되어야 합니다. 이 계정으로 다음 단계의 휴대폰에도 로그인하세요.

## 6. 휴대폰에 Expo Go 설치하고 로그인하기

1. 휴대폰에서 **Expo Go**를 설치하세요.
   - 아이폰: [App Store](https://apps.apple.com/kr/app/expo-go/id982107779)
   - 안드로이드: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. 이미 설치되어 있으면 스토어에서 **업데이트**를 확인하세요.(최신버전이어야 정상적으로 작동)
3. Expo Go를 열고 **계정 / 프로필 메뉴 → 로그인**으로 들어가세요.
4. **4번에서 PC에 로그인한 것과 동일한 Expo 계정**으로 로그인하세요.


## 7. PC와 휴대폰을 같은 Wi-Fi에 연결하기

1. PC와 휴대폰을 **동일한 Wi-Fi 네트워크**에 연결하세요.
2. 아이폰에서 Expo Go의 **로컬 네트워크 접근**을 요청하면 허용하세요.
3. PC에서 Node.js / Expo의 방화벽 연결 허용 요청이 나오면 해당 네트워크의 연결을 허용하세요.

## 8. 개발 서버 실행하고 QR 스캔하기

VS Code 터미널에서 실행하세요.

```bash
npx expo start
```

1. 터미널에 QR 코드가 나올 때까지 기다리세요.
2. 휴대폰으로 QR 코드를 스캔하세요.
   - **아이폰:** 기본 카메라 앱으로 스캔 → Expo Go로 열기
   - **안드로이드:** Expo Go의 **Scan QR code**로 스캔
3. 첫 JavaScript 번들 생성이 끝날 때까지 기다리세요.
4. VIMO 로그인 화면이 나오면 다음 단계로 진행하세요.

**실행 중에는 개발 서버가 켜진 터미널을 유지하세요. 종료할 때는 터미널에서 `Ctrl + C`를 누르세요.**

## 9. VIMO 테스트 계정으로 로그인하기

휴대폰의 **VIMO 앱 로그인 화면**에 아래 계정을 입력하세요.

| 화면 | 아이디 | 비밀번호 |
| --- | --- | --- |
| 관리자 | `admin1` | `0000!` |
| 일반 유저 | `20231234` | `1234!` |

- **관리자:** 로그인 후 관리자 화면으로 이동합니다.
- **일반 유저:** 온보딩이 나오면 **다음 → 다음 → 시작하기**까지 진행하세요.
- 이 표는 **VIMO 테스트 계정**입니다. PC와 휴대폰의 Expo 로그인에는 **본인 Expo 계정**을 사용하세요.

## 다음에 다시 실행할 때

1. VS Code에서 `vimo-frontend` 폴더를 여세요.
2. 휴대폰과 PC를 같은 Wi-Fi에 연결하세요.
3. 프로젝트 터미널에서 실행하세요.

   ```bash
   git switch appdev
   git pull --ff-only origin appdev
   npm install
   npx expo start
   ```

4. 새 QR 코드를 휴대폰으로 스캔하세요.

로컬에서 수정한 파일 때문에 브랜치 전환이나 `pull`이 막히면, 수정 내용을 커밋하거나 보관한 후 다시 진행하세요. Expo 계정에서 로그아웃된 경우에는 PC와 휴대폰에 다시 로그인하세요.


## 오류 발생 시
온준규한테 물어봐도 되지만 gpt한테 물어보면 굉장히 잘 알려줍니다^^