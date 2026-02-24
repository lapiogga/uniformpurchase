'use server'

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Constants based on BR-004 to BR-007
const RANK_POINTS: Record<string, number> = {
    general: 1000000,
    colonel: 800000,
    lt_colonel: 800000,
    major: 800000,
    captain: 600000,
    first_lt: 600000,
    second_lt: 600000,
    warrant: 500000,
    sgt_major: 400000,
    master_sgt: 400000,
    sgt: 400000,
    civil_servant: 400000,
};

const STEP_INCREMENT = 5000; // 호봉당 5,000원 추가

/**
 * 피복 포인트 산정 로직 (BR-004 ~ BR-007)
 * @param user 사용자 객체 (rank, enlist_date, retirement_date 필요)
 * @param fiscalYear 대상 회계 연도 (예: 2026)
 * @returns 산정된 연간 총 포인트
 */
export async function calculateUserAnnualPoints(user: any, fiscalYear: number) {
    // 계급별 기본 포인트 설정 (BR-004)
    const basePoints = RANK_POINTS[user.rank] || 0;

    // 1. 호봉 가산 포인트 (BR-005)
    // 임관 연도와 현재 회계 연도의 차이를 계산하여 호봉당 STEP_INCREMENT(5,000원) 가산
    const enlistYear = new Date(user.enlist_date).getFullYear();
    const tenureYears = fiscalYear - enlistYear;
    const tenurePoints = Math.max(0, tenureYears * STEP_INCREMENT);

    let totalPoints = basePoints + tenurePoints;

    // 2. 전역 예정자 일할 계산 (BR-007)
    // 회계 연도 내에 전역하는 경우, 연초부터 전역일까지의 일수를 계산하여 비례 지급
    if (user.retirement_date) {
        const retireDate = new Date(user.retirement_date);
        if (retireDate.getFullYear() === fiscalYear) {
            const daysInYear = 365;
            const startOfYear = new Date(fiscalYear, 0, 1);
            // 밀리초 차이를 일 단위로 변환 및 올림 처리
            const serviceDays = Math.ceil((retireDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
            totalPoints = Math.floor(totalPoints * (serviceDays / daysInYear));
        }
    }

    return totalPoints;
}

/**
 * 전 사용자 대상 연간 포인트 일괄 지급 (BR-012)
 * @param fiscalYear 지급 대상 연도
 */
export async function grantAnnualPoints(fiscalYear: number) {
    try {
        // 1. 지급 대상인 활성 사용자 목록 조회
        const usersResult = await query("SELECT * FROM users WHERE role = 'user' AND is_active = true");
        const users = usersResult.rows;

        // 트랜잭션 시작: 포인트 지급과 이력 기록의 원자성 보장
        await query('BEGIN');

        for (const user of users) {
            // 해당 연도에 이미 지급된 이력이 있는지 중복 체크 (BR-012)
            const checkResult = await query(
                "SELECT id FROM point_ledger WHERE user_id = $1 AND fiscal_year = $2 AND point_type = 'grant'",
                [user.id, fiscalYear]
            );

            if (checkResult.rows.length > 0) continue;

            // 사용자별 맞춤 포인트 산정
            const points = await calculateUserAnnualPoints(user, fiscalYear);

            // 2. 포인트 원장(Ledger)에 지급 이력 기록
            await query(`
        INSERT INTO point_ledger (user_id, point_type, amount, fiscal_year, description, reference_type)
        VALUES ($1, 'grant', $2, $3, $4, 'annual')
      `, [user.id, points, fiscalYear, `${fiscalYear}년도 정기 피복포인트 지급`]);

            // 3. 포인트 요약(Summary) 테이블의 총 지급액 갱신
            await query(`
        UPDATE point_summary 
        SET total_granted = total_granted + $1, updated_at = NOW()
        WHERE user_id = $2
      `, [points, user.id]);
        }

        // 트랜잭션 커밋
        await query('COMMIT');
        // 관련 페이지 캐시 갱신
        revalidatePath('/admin/points');
        return { success: true };
    } catch (error) {
        // 오류 발생 시 롤백
        await query('ROLLBACK');
        console.error('Failed to grant annual points:', error);
        return { success: false, error: '포인트 지급 중 오류가 발생했습니다.' };
    }
}

/**
 * 특정 사용자의 포인트 요약 정보 조회
 */
export async function getPointSummary(userId: string) {
    try {
        const result = await query("SELECT * FROM point_summary WHERE user_id = $1", [userId]);
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Failed to fetch point summary:', error);
        return { success: false, error: '포인트 현황을 불러오는 중 오류가 발생했습니다.' };
    }
}
