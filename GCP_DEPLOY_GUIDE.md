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
- **조치**: 실제 GCP Cloud SQL의 내부 연결 주소(Unix Socket) 형식으로 `DATABASE_URL` 수정.

### 🛑 이슈 2: `ENOENT /cloudsql/.../.s.PGSQL.5432`
- **원인**: Cloud Run 설정에 Cloud SQL 인스턴스 연결이 누락됨.
- **조치**: `cloudbuild.yaml` 및 배포 명령어에 `--add-cloudsql-instances` 옵션 추가.

### 🛑 이슈 3: `EIO (Input/Output Error)`
- **원인**: 소켓 연결 시 SSL 설정 충돌 및 권한 부족.
- **조치**: 
  1. `src/lib/db.ts`에서 `/cloudsql` 접속 시 SSL을 자동으로 비활성화하는 로직 반영.
  2. Cloud Run 서비스 계정에 `Cloud SQL 클라이언트` IAM 역할 부여.

---

## 3. 데이터베이스(Cloud SQL) 설정 및 초기화

운영 환경의 데이터베이스는 자동으로 생성되지 않으므로, 아래 절차에 따라 테이블을 생성하고 기본 데이터를 채워야 합니다.

### 1) 인스턴스 정보 확인
GCP 콘솔에서 생성한 Cloud SQL 인스턴스의 **공개 IP 주소**와 **사용자(admin) 비밀번호**를 준비합니다.

### 2) 로컬에서 스키마 및 데이터 주입
사용자님의 로컬 터미널에서 아래 명령어를 실행하여 클라우드 DB를 초기화합니다.
(로컬 PC의 IP가 Cloud SQL의 '승인된 네트워크'에 등록되어 있어야 합니다.)

```bash
# 1. 테이블 스키마 생성
psql "postgresql://admin:[비밀번호]@[공개_IP]:5432/uniform_db" -f db-init/1-schema.sql

# 2. 기초/테스트 데이터(시드) 주입
psql "postgresql://admin:[비밀번호]@[공개_IP]:5432/uniform_db" -f db-init/2-seed-expanded.sql
```

---

## 4. 최종 배포 체크리스트

### STEP 1: IAM 권한 부여 (최초 1회 필수)
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

## 5. 향후 운영 팁
- **로그 확인**: `gcloud run services logs read uniform-app --limit=20`
- **로컬 DB 확인**: `node --env-file=.env.local check-local-db.js` 명령어로 로컬 DB 상태를 수시로 점검할 수 있습니다.
