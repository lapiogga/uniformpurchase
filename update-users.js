import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: "postgresql://admin:admin123@127.0.0.1:5433/uniform_db"
});

async function query(text, params) {
    return pool.query(text, params);
}

async function updateUsers() {
    try {
        console.log('Updating user accounts...');

        // 1. Define accounts with valid UUIDs
        const users = [
            {
                id: '00000000-0000-0000-0002-000000000001',
                email: 'admin@mil.kr',
                name: '군수담당자',
                role: 'admin',
                rank: 'major',
                military_number: '05-10042',
                unit: '육군본부 군수사',
                is_active: true
            },
            {
                id: '00000000-0000-0000-0002-000000000002',
                email: 'store@mil.kr',
                name: '피복판매소 담당자',
                role: 'store',
                rank: 'master_sgt',
                military_number: '10-20031',
                unit: '육군본부 판매소',
                store_id: '00000000-0000-0000-0000-000000000001',
                is_active: true
            },
            {
                id: '00000000-0000-0000-0002-000000000003',
                email: 'tailor@mil.kr',
                name: '체척업체 담당자',
                role: 'tailor',
                unit: '(주)군복장인',
                tailor_id: '00000000-0000-0000-0001-000000000001',
                is_active: true
            },
            {
                id: '00000000-0000-0000-0002-000000000004',
                email: 'user@mil.kr',
                name: '홍길동',
                role: 'user',
                rank: 'captain',
                military_number: '15-12345',
                unit: '제1보병사단',
                is_active: true
            }
        ];

        for (const user of users) {
            // Create summary first if it's a regular user to avoid FK issues if logic exists elsewhere, 
            // though here it's just users table.

            await query(`
                INSERT INTO users (id, email, name, role, rank, military_number, unit, is_active, store_id, tailor_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (email) DO UPDATE SET
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    rank = EXCLUDED.rank,
                    military_number = EXCLUDED.military_number,
                    unit = EXCLUDED.unit,
                    is_active = EXCLUDED.is_active,
                    store_id = EXCLUDED.store_id,
                    tailor_id = EXCLUDED.tailor_id
            `, [
                user.id, user.email, user.name, user.role, user.rank || null,
                user.military_number || null, user.unit, user.is_active,
                user.store_id || null, user.tailor_id || null
            ]);
            console.log(`User ${user.email} updated/created.`);
        }

        console.log('All user accounts updated successfully.');
    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

updateUsers();
