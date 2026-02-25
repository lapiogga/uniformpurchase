'use server'

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 체척권 번호로 상세 정보 조회
 * @param ticketNumber 체척권 고유 번호 (TKT-YYYYMMDD-NNNNN)
 */
export async function getTicketByNumber(ticketNumber: string) {
    try {
        // 체척권 정보와 함께 사용자명, 주문 항목 정보, 품목명을 조인하여 조회
        const result = await query(`
      SELECT t.*, u.name as user_name, u.military_number, u.rank, ui.unit_price, p.name as product_name
      FROM tailoring_tickets t
      JOIN users u ON t.user_id = u.id
      JOIN order_items ui ON t.order_item_id = ui.id
      JOIN products p ON ui.product_id = p.id
      WHERE t.ticket_number = $1
    `, [ticketNumber]);

        if (result.rows.length === 0) {
            return { success: false, error: '해당 번호의 체척권을 찾을 수 없습니다.' };
        }

        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Failed to fetch ticket:', error);
        return { success: false, error: '조회 중 오류가 발생했습니다.' };
    }
}

/**
 * 체척권 업체 등록 (사용자가 체척을 위해 업체를 방문했을 때 처리)
 * @param ticketId 체척권 ID
 * @param tailorId 체척업체 ID
 */
export async function registerTicket(ticketId: string, tailorId: string) {
    try {
        // 1. 현재 체척권 상태 확인 (이미 등록되었는지 확인)
        const checkResult = await query('SELECT status FROM tailoring_tickets WHERE id = $1', [ticketId]);
        if (checkResult.rows[0].status !== 'issued') {
            return { success: false, error: '이미 등록되었거나 취소된 체척권입니다.' };
        }

        // 2. 상태를 'registered'로 변경하고 업체 ID와 등록 일시 저장
        await query(`
      UPDATE tailoring_tickets 
      SET status = 'registered', tailor_id = $1, registered_at = NOW(), updated_at = NOW()
      WHERE id = $2
    `, [tailorId, ticketId]);

        // 관련 페이지 캐시 갱신
        revalidatePath('/tailor/tickets');
        return { success: true };
    } catch (error) {
        console.error('Failed to register ticket:', error);
        return { success: false, error: '체척권 등록 중 오류가 발생했습니다.' };
    }
}

/**
 * 특정 체척업체에 등록된 체척권 목록 조회
 * @param tailorId 업체 ID
 */
export async function getTailorTickets(tailorId: string) {
    try {
        const result = await query(`
      SELECT t.*, u.name as user_name, u.military_number, u.rank, p.name as product_name
      FROM tailoring_tickets t
      JOIN users u ON t.user_id = u.id
      JOIN order_items ui ON t.order_item_id = ui.id
      JOIN products p ON ui.product_id = p.id
      WHERE t.tailor_id = $1
      ORDER BY t.registered_at DESC
    `, [tailorId]);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch tailor tickets:', error);
        return { success: false, error: '목록 조회 중 오류가 발생했습니다.' };
    }
}
