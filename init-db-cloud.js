
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';

// .env.local 대신 직접 주소를 입력하거나 환경변수를 사용합니다.
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL 환경변수가 설정되지 않았습니다.');
    console.log('실행 예: $env:DATABASE_URL="your_url"; node init-db-cloud.js');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

async function runSqlFile(filePath) {
    console.log(`📖 실행 중: ${path.basename(filePath)}...`);
    const sql = fs.readFileSync(filePath, 'utf8');

    // psql과 달리 원시 SQL 문자열을 실행하기 위해 ; 단위로 나누거나 통째로 실행합니다.
    // pg 라이브러리는 세미콜론으로 구분된 여러 명령을 한 번에 실행할 수 있습니다.
    try {
        await pool.query(sql);
        console.log(`✅ ${path.basename(filePath)} 완료!`);
    } catch (err) {
        console.error(`❌ ${path.basename(filePath)} 오류:`, err.message);
        throw err;
    }
}

async function initialize() {
    try {
        console.log('--- 클라우드 데이터베이스 초기화 시작 ---');

        // 1. 스키마 생성
        await runSqlFile('./db-init/1-schema.sql');

        // 2. 시드 데이터 주입
        await runSqlFile('./db-init/2-seed-expanded.sql');

        console.log('\n✨ 모든 작업이 성공적으로 완료되었습니다!');
    } catch (err) {
        console.error('\n💥 초기화 실패. 위 오류를 확인해 주세요.');
    } finally {
        await pool.end();
    }
}

initialize();
