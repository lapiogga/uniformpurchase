# 구글 클라우드(GCP) 배포를 위한 로컬 설정 및 절차 안내서

본 문서는 피복구매시스템을 Google Cloud Platform(GCP)의 Cloud Run 환경에 배포하기 위해 로컬 컴퓨터에 추가/변경한 사항과 세부 배포 절차를 설명합니다.

---

## 1. 로컬 컴퓨터 추가 및 변경 파일 정리

GCP 배포를 위해 프로젝트 루트 디렉토리에 다음과 같은 파일들이 추가/수정되었습니다.

### 📁 신규 추가된 파일
1.  **`Dockerfile`**: 애플리케이션을 컨테이너화하기 위한 명세서입니다.
    *   Next.js 15의 `standalone` 모드를 사용하여 최적화된 실행 환경을 제공합니다.
    *   빌드 결과물을 최소화하여 GCP 배포 속도를 높이고 비용을 절감합니다.
2.  **`cloudbuild.yaml`**: GCP Cloud Build 서비스가 수행할 작업 스크립트입니다.
    *   Docker 이미지를 빌드하고 Artifact Registry에 푸시한 후, Cloud Run에 최종 배포하는 과정을 자동화합니다.
    *   데이터베이스(Cloud SQL)와의 연결 설정(`--add-cloudsql-instances`)이 포함되어 있습니다.
3.  **`deploy-to-gcp.bat`**: 윈도우 환경에서 클릭 한 번으로 배포를 수행할 수 있게 만든 배치 파일입니다.
    *   GCP 프로젝트 설정, API 활성화, 빌드 실행 과정을 순차적으로 처리합니다.
4.  **`GCP_DEPLOY_GUIDE.md`**: 배포 과정에서 발생할 수 있는 이슈와 해결 방법을 정리한 기술 매뉴얼입니다.

### 🛠️ 기존 코드 수정 사항
1.  **`next.config.ts`**: GCP 배포를 위해 `output: 'standalone'` 옵션이 활성화되었습니다.
2.  **`src/lib/db.ts`**: 클라우드 환경(Unix Socket)과 로컬 환경(TCP) 모두에서 데이터베이스에 접속할 수 있도록 접속 로직을 유연하게 수정했습니다.
3.  **`src/actions/*.ts`**: 빌드 시점의 DB 의존성을 제거하기 위해 서버 액션이 포함된 페이지들에 `force-dynamic` 설정을 추가했습니다.

---

## 2. 배포 전 필수 로컬 환경 설정 하우투 (How-to)

배포를 수행하기 전, 사용자님의 컴퓨터에 다음 설정이 완료되어 있어야 합니다.

### ① Google Cloud SDK(gcloud) 설치 확인
*   **설치 경로**: `C:\Users\User\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin`
*   **명령어 확인**: 터미널에서 `gcloud --version`을 입력했을 때 버전 정보가 나오지 않는다면, 위 경로를 환경 변수(Path)에 등록하거나 전체 경로를 사용하여 명령을 실행해야 합니다.
    *   **💡 팁**: 본 프로젝트의 `deploy-to-gcp.bat` 파일에는 이미 사용자님의 컴퓨터 경로가 자동으로 설정되어 있어 별도의 패스 설정 없이도 즉시 실행이 가능합니다.

### ② GCP 로그인 및 프로젝트 설정
1.  **로그인**: `gcloud auth login` 명령어를 통해 브라우저에서 계정을 인증합니다.
2.  **프로젝트 지정**: `gcloud config set project [PROJECT_ID]` (현재 프로젝트: `uniformpurchase`)

### ③ Cloud SQL 초기화 및 데이터 가이드 (필수)
클라우드 DB 서버는 생성 직후 비어 있으므로, 로컬에서 데이터를 넣어줘야 합니다.
1.  **스키마 주입**: `psql "postgresql://admin:admin123@[Cloud_SQL_IP]:5432/uniform_db" -f db-init/1-schema.sql`
2.  **데이터 주입**: `psql "postgresql://admin:admin123@[Cloud_SQL_IP]:5432/uniform_db" -f db-init/2-seed-expanded.sql`
    *   **💡 참고**: 현재 사용자님의 GCP 환경에 `admin` 계정과 `uniform_db` 데이터베이스는 제가 미리 생성해 두었습니다. DB 통신을 위해 Cloud SQL의 **'승인된 네트워크'**에 사용자님 로컬 IP를 추가한 후 위 명령어를 실행하시면 됩니다.

---

## 3. 상세 배포 절차 (Method)

모든 설정이 완료되었다면 다음 방법 중 하나로 배포를 수행합니다.

### 방법 A: 배치 파일 사용 (권장)
사용자 편의를 위해 제작된 `deploy-to-gcp.bat` 파일을 실행합니다.
1.  파일 우클릭 -> 편집을 눌러 `PROJECT_ID`와 `DATABASE_URL`이 맞는지 확인합니다.
2.  파일을 더블 클릭하여 실행합니다.
3.  성공적으로 완료되면 터미널 창에 `https://...` 형태의 접속 주소가 출력됩니다.

### 방법 B: 수동 명령어 사용 (고급)
터미널에서 직접 명령어를 입력하여 단계별로 제어하고 싶을 때 사용합니다.

```bash
# 1. 빌드 및 푸시, 배포를 한 번에 실행
gcloud builds submit --config cloudbuild.yaml --substitutions=_DATABASE_URL="postgresql://admin:admin123@/uniform_db?host=/cloudsql/uniformpurchase:asia-northeast3:free-trial-first-project" .
```

---

## 4. 운영 및 모니터링

배포 완료 후 상태를 확인하는 방법입니다.
*   **로그 확인**: `gcloud run services logs read uniform-app` 명령어로 서버 오류를 실시간으로 모니터링할 수 있습니다.
*   **상태 체크**: Google Cloud 콘솔의 Cloud Run 메뉴에서 CPU 사용량과 활성 인스턴스 수를 확인할 수 있습니다.
