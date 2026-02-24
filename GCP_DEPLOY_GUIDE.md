# GCP Cloud Run 배포 및 운영 매뉴얼

본 문서는 피복구매시스템의 Google Cloud Platform(GCP) 배포 과정에서 발생한 이슈들과 해결 방법, 그리고 안정적인 운영을 위한 설정 가이드를 정리합니다.

---

## 1. 프로젝트 요약 및 수정 사항
이번 배포 준비를 통해 아래와 같은 핵심 개선 사항이 반영되었습니다.
- **Next.js 15 Standalone 모드 도입**: Docker 이미지 크기를 최적화하고 실행 속도를 개선함.
- **실시간 데이터 로딩 최적화**: DB 연동 페이지에 `force-dynamic`을 적용하여 빌드 시점의 DB 의존성 제거.
- **런타임 안정성 강화**: `Array.isArray` 체크 및 컴포넌트 타입 캐스팅을 통해 `undefined` 에러 완벽 방지.
- **Cloud SQL 연결 최적화**: Unix Socket 방식을 지원하도록 DB 풀링 로직 개선.

---

## 2. 발생했던 주요 오류 및 조치 분석

### 🛑 이슈 1: `ENETUNREACH 1.2.3.4:5432`
- **원인**: 배포 명령어의 `DATABASE_URL`에 예시 주소(1.2.3.4)를 그대로 사용함.
- **분석**: 앱이 외부 네트워크의 존재하지 않는 IP로 접속을 시도하여 네트워크 도달 불가 에러 발생.
- **조치**: 실제 GCP Cloud SQL의 내부 연결 주소(Unix Socket) 형식으로 `DATABASE_URL` 수정.

### 🛑 이슈 2: `ENOENT /cloudsql/.../.s.PGSQL.5432`
- **원인**: Cloud Run 설정에 Cloud SQL 인스턴스 연결이 누락됨.
- **분석**: Cloud Run은 보안상 명시적으로 연결된 인스턴스가 없으면 `/cloudsql` 경로의 소켓 파일을 생성하지 않음.
- **조치**: `cloudbuild.yaml` 및 배포 명령어에 `--add-cloudsql-instances` 옵션 추가.

### 🛑 이슈 3: `EIO (Input/Output Error) / Digest: 541220859`
- **원인**: 소켓 연결 시 SSL 설정 충돌 및 권한 부족.
- **분석**: Unix Socket 방식은 이미 보안 채널이므로 추가적인 SSL 핸드셰이크가 충돌을 일으킴. 또한 서비스 계정에 DB 클라이언트 권한 누락.
- **조치**: 
  1. `src/lib/db.ts`에서 `/cloudsql` 접속 시 SSL을 자동으로 비활성화하는 로직 반영.
  2. Cloud Run 서비스 계정에 `Cloud SQL 클라이언트` IAM 역할 부여.

---

## 3. 최종 배포 체크리스트

### STEP 1: IAM 권한 부여 (최초 1회 필수)
Cloud Run이 DB에 노크할 수 있도록 권한을 줍니다.
```bash
gcloud projects add-iam-policy-binding [PROJECT_ID] \
    --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

### STEP 2: 서비스 활성화
```bash
gcloud services enable sqladmin.googleapis.com cloudbuild.googleapis.com run.googleapis.com
```

### STEP 3: 최신화된 소스 배포
```bash
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_DATABASE_URL="postgresql://[USER]:[PASS]@/[DB_NAME]?host=/cloudsql/[PROJECT_ID]:[REGION]:[INSTANCE_NAME]" \
    .
```

---

## 4. 향후 운영 팁
- **로그 확인**: 문제가 생기면 `gcloud run services logs read uniform-app --limit=20` 명령어로 즉시 진단이 가능합니다.
- **환경 변수 관리**: 보안을 위해 비밀번호 등은 GCP Secret Manager를 사용하는 것을 권장합니다.
- **DB 마이그레이션**: 운영 DB에 테이블이 없을 경우, 로컬의 SQL 파일을 Cloud SQL 콘솔의 '가져오기' 기능을 통해 실행해 주세요.
