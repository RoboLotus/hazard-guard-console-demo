# HazardGuard Console Demo

HazardGuard 관제 WebUI의 정적 데모입니다. 실제 FastAPI, WebSocket, ROS 2, 로봇과 연결하지 않으며 화면 구성과 주요 화면 흐름을 빠르게 확인하는 용도입니다.

## 실행

```powershell
npm ci
npm run dev
```

브라우저에서 표시된 주소를 엽니다.

## 배포

GitHub Pages용 배포 워크플로가 포함되어 있습니다. 저장소 생성 후 `main` 브랜치에 push하고, GitHub 저장소의 **Settings → Pages → Build and deployment → GitHub Actions**를 선택하면 됩니다.

모든 배포 화면에는 `DEMO MODE` 안내가 표시됩니다. 실제 로봇 명령이나 API 호출은 하지 않습니다.

