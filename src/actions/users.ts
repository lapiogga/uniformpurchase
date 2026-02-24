'use server'

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 사용자 목록 조회 (필터 및 검색 지원)
 * @param filters 역할, 계급, 검색어(이름/군번) 필터
 */
export async function getUsers(filters?: { role?: string; rank?: string; search?: string }) {
    try {
        let sql = 'SELECT * FROM users WHERE is_active = true';
        const params: any[] = [];

        // 역할 필터링 (admin, store, tailor, user 등)
        if (filters?.role) {
            params.push(filters.role);
            sql += ` AND role = $${params.length}`;
        }

        // 계급 필터링
        if (filters?.rank) {
            params.push(filters.rank);
            sql += ` AND rank = $${params.length}`;
        }

        // 이름 또는 군번으로 키워드 검색
        if (filters?.search) {
            params.push(`%${filters.search}%`);
            sql += ` AND (name ILIKE $${params.length} OR military_number ILIKE $${params.length})`;
        }

        sql += ' ORDER BY created_at DESC';

        const result = await query(sql, params);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return { success: false, error: '사용자 목록을 불러오는 중 오류가 발생했습니다.' };
    }
}

/**
 * 신규 사용자 등록
 * @param userData 사용자 기본 정보 및 인사 데이터
 */
export async function createUser(userData: any) {
    try {
        // [참고] 실제 운영 환경에서는 Google Cloud Identity Platform API 호출이 병행되어야 함
        const sql = `
      INSERT INTO users (
        id, email, name, role, rank, military_number, unit, 
        enlist_date, promotion_date, retirement_date, store_id, tailor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

        const params = [
            userData.id, // 인증 제공자(Auth)로부터 전달받은 고유 UID
            userData.email,
            userData.name,
            userData.role,
            userData.rank,
            userData.military_number,
            userData.unit,
            userData.enlist_date,
            userData.promotion_date,
            userData.retirement_date,
            userData.store_id || null, // 판매소 관리자인 경우
            userData.tailor_id || null  // 체척업체 사용자인 경우
        ];

        const result = await query(sql, params);

        // 일반 사용자('user') 역할로 등록될 경우, 포인트 관리용 요약 레코드를 즉시 생성
        if (userData.role === 'user') {
            await query('INSERT INTO point_summary (user_id) VALUES ($1)', [userData.id]);
        }

        // 관리자 페이지 데이터 최신화
        revalidatePath('/admin/users');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Failed to create user:', error);
        return { success: false, error: '사용자 등록 중 오류가 발생했습니다.' };
    }
}

/**
 * 사용자 활성화/비활성화 상태 변경
 */
export async function updateUserStatus(userId: string, isActive: boolean) {
    try {
        await query('UPDATE users SET is_active = $1 WHERE id = $2', [isActive, userId]);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user status:', error);
        return { success: false, error: '상태 변경 중 오류가 발생했습니다.' };
    }
}
