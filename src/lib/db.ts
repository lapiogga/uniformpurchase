/**
 * [수정 이력]
 * - 2026-02-24 18:20: 시스템 내 다른 PostgreSQL(Port 5432)과의 충돌 확인
 * - 조치: 호스트 포트를 5433으로 변경하고 DATABASE_URL 환경변수 기반으로 복구
 * - 2026-02-24 18:15: DB 인증 오류(SASL: SCRAM) 해결 시도
 * - 조치: connectionString에 하드코딩된 변수 제거 및 DATABASE_URL 환경변수만 사용
 */
import { Pool } from 'pg';

const isUnixSocket = process.env.DATABASE_URL?.includes('/cloudsql');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.NODE_ENV === 'production' && !isUnixSocket)
    ? { rejectUnauthorized: false }
    : false,
  max: 10, // 최대 연결 수 제한
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // 연결 타임아웃 5초
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;
