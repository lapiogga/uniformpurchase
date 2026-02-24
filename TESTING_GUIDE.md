# 통합 테스트 가이드 (Testing Guide)

본 문서는 로컬 개발 환경에서의 기능 점검 및 데이터베이스 연결 확인을 위한 가이드를 제공합니다.

## 1. 환경 설정 확인
- **데이터베이스 포트**: 시스템 내 다른 PostgreSQL과의 충돌을 피하기 위해 **5433** 포트를 사용합니다.
- **환경 변수 (.env.local)**:
  ```env
  DATABASE_URL=postgresql://admin:admin123@127.0.0.1:5433/uniform_db
  ```

## 2. 서비스 기동
```bash
# Docker 컨테이너 재기동 (포인트/재고 초기화 포함)
docker-compose down
docker-compose up -d

# Next.js 개발 서버 기동
npm run dev
```

## 3. 주요 점검 페이지
1. **로그인 페이지**: `http://localhost:3000` (또는 지정된 포트)
   - 테스트 계정 정보가 하단에 표시되는지 확인.
2. **사용자 관리**: `/admin/users`
   - DB에서 사용자 목록을 정상적으로 가져오는지 확인 (SASL 인증 오류 여부).
3. **품목 관리**: `/admin/products`
   - 카테고리 필터 및 검색 기능 작동 여부 확인.
4. **재고 현황**: `/store/inventory`
   - 현재고 수량 및 스타일(Tailwind v4) 적용 상태 확인.

## 4. 문제 해결 (Troubleshooting)
- **Style 미적용**: `globals.css` 상단의 `@import "tailwindcss";`와 `postcss.config.mjs` 설정을 확인하세요.
- **DB 연결 실패**: `docker ps`로 `uniform-system-db` 컨테이너가 5433 포트로 매핑되어 실행 중인지 확인하세요.
- **Build 오류**: Next.js 15에서는 `searchParams`가 `Promise`이므로 반드시 `await` 처리해야 합니다.
