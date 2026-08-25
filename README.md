# HazardGuard Console Demo

HazardGuard 관제 WebUI의 정적 데모입니다. 실제 FastAPI, WebSocket, ROS 2, 로봇과 연결하지 않으며 화면 구성과 주요 화면 흐름을 빠르게 확인하는 용도입니다.

## 제공 기능

- `real_factory` 기반 2D 점유 지도 확대·축소·드래그
- 복수 웨이포인트 추가, 이름·순서·관측 방향·정지 시간 편집
- 설비 위치 추가와 X/Y/Z ROI 조절 및 겹침 방지
- 동일 좌표계의 128,659포인트 3D 지도 회전·이동·확대/축소
- 3D 설비 ROI·이름과 예시 로봇 위치 표시
- 정상·주의·위험 열화상 데모 레이어 전환
- 브라우저 로컬 저장과 최초 샘플 복원

웨이포인트 순찰 실행, ROS 모드 변경, 센서 연결 및 비콘 배출은 실제로 수행하지 않습니다.

## 실행

```powershell
npm ci
npm run dev
```

브라우저에서 표시된 주소를 엽니다.

## 지도 자산

2D와 3D 지도는 모두 `RoboLotus/Simulation_env`의 `real_factory.pgm` 좌표계를 사용합니다.

| 파일 | 역할 |
|---|---|
| `public/maps/real-factory/map.png` | 브라우저용 2D 점유 지도 |
| `public/maps/real-factory/cloud.ply` | 동일 점유 지도를 높이 방향으로 표본화한 정적 3D 점군 |
| `public/maps/real-factory/metadata.json` | 해상도, 원점, 범위와 점 개수 |

자산을 다시 생성하려면 상위 폴더에 `Simulation_env` 저장소가 있어야 합니다.

```powershell
npm run assets:maps
```

현재 3D 자산은 정적 UI 조작을 검증하기 위해 점유 지도를 입체화한 것입니다. 실제 RGB-D 카메라로 수집한 포인트클라우드나 열화상 측정 결과가 아닙니다.

## 검증

```powershell
npm test
npm run build
```

테스트는 지도 크기·원점, 3D PLY 형식, 웨이포인트 순서 추천, ROI 충돌, 브라우저 저장, 열화상 프리셋과 정적 자산 요청 정책을 확인합니다.

## 배포

GitHub Pages용 배포 워크플로가 포함되어 있습니다. 저장소 생성 후 `main` 브랜치에 push하고, GitHub 저장소의 **Settings → Pages → Build and deployment → GitHub Actions**를 선택하면 됩니다.

모든 배포 화면에는 `DEMO MODE` 안내가 표시됩니다. 실제 로봇 명령이나 API 호출은 하지 않습니다.
