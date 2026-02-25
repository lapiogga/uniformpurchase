'use server'

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 정산 요청 (등록된 체척권들에 대해 정산 레코드 생성)
 * REQ-A-042 연관
 */
export async function requestSettlement(tailorId: string) {
    try {
        await query('BEGIN');

        // 1. 정산 대상 체척권 조회 (status = 'registered')
        // [참고] 현재 스키마상 정산 여부를 판단할 별도 컬럼이 없으므로, 
        // 일단 모든 'registered' 건을 대상으로 새 정산 요청을 생성함
        const ticketsResult = await query(`
            SELECT t.id, ui.unit_price
            FROM tailoring_tickets t
            JOIN order_items ui ON t.order_item_id = ui.id
            WHERE t.tailor_id = $1 AND t.status = 'registered'
        `, [tailorId]);

        const tickets = ticketsResult.rows;
        if (tickets.length === 0) {
            await query('ROLLBACK');
            return { success: false, error: '정산 가능한 등록된 체척권이 없습니다.' };
        }

        const ticketCount = tickets.length;
        // 정산 금액 계산 (여기선 품목 단가의 10%를 수수료로 가정하거나, 건당 고정 금액 사용 가능)
        // 일단 요구사항에 별도 로직이 없으므로 건당 25,000원 고정으로 구현
        const totalAmount = ticketCount * 25000;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // 2. tailor_settlements 테이블에 기록
        const settlementResult = await query(`
            INSERT INTO tailor_settlements (tailor_id, settlement_period_start, settlement_period_end, total_amount, ticket_count, status)
            VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING id
        `, [tailorId, startOfMonth, endOfMonth, totalAmount, ticketCount]);

        // 3. 체척권 상태 변경 (정산 요청됨)
        // status 컬럼에 'settlement_requested'를 추가하여 중복 정산 방지
        for (const ticket of tickets) {
            await query(`
                UPDATE tailoring_tickets 
                SET status = 'settlement_requested', updated_at = NOW()
                WHERE id = $1
            `, [ticket.id]);
        }

        await query('COMMIT');
        revalidatePath('/tailor/dashboard');
        return { success: true, data: settlementResult.rows[0] };
    } catch (error) {
        await query('ROLLBACK');
        console.error('Failed to request settlement:', error);
        return { success: false, error: '정산 요청 중 오류가 발생했습니다.' };
    }
}

/**
 * 정산 내역 조회
 */
export async function getTailorSettlements(tailorId: string) {
    try {
        const result = await query(`
            SELECT * FROM tailor_settlements 
            WHERE tailor_id = $1 
            ORDER BY created_at DESC
        `, [tailorId]);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch settlements:', error);
        return { success: false, error: '정산 내역 조회 중 오류가 발생했습니다.' };
    }
}
