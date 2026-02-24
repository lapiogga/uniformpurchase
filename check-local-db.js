import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // 로컬 테스트용
});

async function checkDatabase() {
    console.log('--- 데이터베이스 상태 확인 ---');
    try {
        const tables = ['users', 'stores', 'products', 'point_summary', 'point_ledger'];
        for (const table of tables) {
            try {
                const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`✅ ${table}: ${res.rows[0].count}개 레코드 존재`);
            } catch (err) {
                console.log(`❌ ${table}: 테이블이 없거나 조회 실패 (${err.message})`);
            }
        }
    } catch (err) {
        console.error('DB 연결 실패:', err.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
