
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://admin:admin123@127.0.0.1:5433/uniform_db',
});

async function test() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Successfully connected to the database at:', res.rows[0].now);
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
}

test();
