# GCP Cloud Run 배포 가이드

피복구매시스템을 Google Cloud Platform(GCP)에 배포하기 위한 절차입니다. 환경 구성 및 배포 명령어를 순서대로 수행해 주세요.

## 1. 사전 준비 (Local Environment)
1. **Google Cloud SDK 설치**: [설치 가이드](https://cloud.google.com/sdk/docs/install)를 따라 설치 후 `gcloud init`을 수행합니다.
2. **프로젝트 설정**:
   ```bash
   gcloud config set project [PROJECT_ID]
   ```

## 2. GCP 서비스 활성화
배포에 필요한 주요 API를 활성화합니다.
```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    sqladmin.googleapis.com
```

## 3. Artifact Registry 저장소 생성
빌드된 이미지를 저장할 공간을 만듭니다.
```bash
gcloud artifacts repositories create uniform-purchase \
    --repository-format=docker \
    --location=asia-northeast3 \
    --description="Uniform Purchase System App"
```

## 4. 데이터베이스(Cloud SQL) 설정
1. **인스턴스 생성**: PostgreSQL 15 인스턴스를 생성합니다.
2. **데이터베이스 및 사용자**: `uniform_db` 데이터베이스와 `admin` 사용자를 만듭니다.
3. **연결 권한**: Cloud Run 서비스 계정에 `Cloud SQL 클라이언트` 역할을 부여합니다.

## 5. 배포 실행
현재 프로젝트 루트 디렉토리에서 아래 명령어를 실행합니다. (`[PROJECT_ID]`와 `[DATABASE_URL]` 등은 실제 환경에 맞게 수정)

```bash
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_DATABASE_URL="postgresql://admin:[PASSWORD]@/uniform_db?host=/cloudsql/[PROJECT_ID]:asia-northeast3:[INSTANCE_NAME]" \
    .
```

## 6. 주의 사항
- **환경 변수**: `cloudbuild.yaml`에 정의된 `substitutions`는 기본값이며, 배포 시 `--substitutions` 옵션으로 실시간 값을 덮어쓰는 것을 권장합니다.
- **포트**: Dockerfile에서 앱은 `3000`번 포트를 사용하도록 설정되어 있으며, Cloud Run은 이를 자동으로 감지합니다. (내부 포트 매핑 확인 필수)
- **보안**: 운영 환경에서는 `DATABASE_URL`을 Secret Manager에 저장하고 연동하는 것이 좋습니다.

배포 과정 중 오류가 발생하거나 추가 도움이 필요하시면 말씀해 주세요.
