'use server'

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * BR-020 ~ BR-023 주문 관련 규칙 적용
 */

/**
 * 온라인 주문 생성 (REQ-U-151, BR-020 ~ BR-023)
 * @param orderData 주문자 ID, 판매소 ID, 품목 유형(완제품/맞춤), 주문 항목 등
 * @returns 주문 성공 여부 및 생성된 주문 번호
 */
export async function createOnlineOrder(orderData: {
    userId: string;
    storeId: string;
    productType: 'finished' | 'custom';
    items: any[];
    deliveryMethod?: 'parcel' | 'direct';
    deliveryAddress?: string;
    deliveryZoneId?: string;
}) {
    try {
        // 주문 총액 계산
        const totalAmount = orderData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

        // 1. 가용 포인트 검증 (BR-001, BR-002)
        // 잔여 포인트 = 총 지급액 - 사용액 - 예약액
        const summaryResult = await query(
            'SELECT (total_granted - used_points - reserved_points) as available FROM point_summary WHERE user_id = $1',
            [orderData.userId]
        );
        if (!summaryResult.rows[0] || summaryResult.rows[0].available < totalAmount) {
            return { success: false, error: '가용 포인트가 부족합니다.' };
        }

        // 트랜잭션 시작: 주문 생성과 포인트 예약의 정합성 보장
        await query('BEGIN');

        // 2. 고유 주문 번호 생성 (ORD-YYYYMMDD-NNNNN)
        // 날짜 기반 문자열과 DB 시퀀스를 결합하여 생성
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const seqResult = await query("SELECT nextval('order_number_seq')");
        const orderNumber = `ORD-${dateStr}-${seqResult.rows[0].nextval.toString().padStart(5, '0')}`;

        // 3. 주문 마스터 정보 저장
        const orderResult = await query(`
      INSERT INTO orders (
        order_number, user_id, store_id, order_type, product_type, status, 
        total_amount, delivery_method, delivery_address, delivery_zone_id
      ) VALUES ($1, $2, $3, 'online', $4, 'pending', $5, $6, $7, $8)
      RETURNING id
    `, [
            orderNumber, orderData.userId, orderData.storeId,
            orderData.productType, totalAmount,
            orderData.deliveryMethod, orderData.deliveryAddress, orderData.deliveryZoneId
        ]);
        const orderId = orderResult.rows[0].id;

        // 4. 주문 상세 항목(Items) 저장
        for (const item of orderData.items) {
            await query(`
        INSERT INTO order_items (order_id, product_id, spec_id, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [orderId, item.productId, item.specId, item.quantity, item.unitPrice, item.unitPrice * item.quantity]);
        }

        // 5. 포인트 원장 기록 및 예약액 차감 (BR-030)
        // 실제 결제 전까지 포인트를 '예약(reserve)' 상태로 묶어둠
        await query(`
      INSERT INTO point_ledger (user_id, point_type, amount, reference_type, reference_id, description)
      VALUES ($1, 'reserve', $2, 'order', $3, '온라인 구매 포인트 예약')
    `, [orderData.userId, totalAmount, orderId]);

        await query(`
      UPDATE point_summary 
      SET reserved_points = reserved_points + $1, updated_at = NOW()
      WHERE user_id = $2
    `, [totalAmount, orderData.userId]);

        // 6. 맞춤피복 주문 시 체척권(Tailoring Ticket) 자동 발행 (BR-030)
        // 사용자가 치수를 잴 수 있도록 티켓 번호를 생성하여 할당
        if (orderData.productType === 'custom') {
            for (const item of orderData.items) {
                const ticketDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const ticketSeqResult = await query("SELECT nextval('ticket_number_seq')");
                const ticketNumber = `TKT-${ticketDate}-${ticketSeqResult.rows[0].nextval.toString().padStart(5, '0')}`;

                await query(`
          INSERT INTO tailoring_tickets (ticket_number, user_id, status)
          VALUES ($1, $2, 'issued')
        `, [ticketNumber, orderData.userId]);
            }
        }

        // 트랜잭션 완료
        await query('COMMIT');
        // 내 주문 목록 페이지 데이터 갱신
        revalidatePath('/my/orders');
        return { success: true, orderNumber };
    } catch (error) {
        // 오류 발생 시 모든 변경사항 롤백
        await query('ROLLBACK');
        console.error('Order creation failed:', error);
        return { success: false, error: '주문 처리 중 서버 오류가 발생했습니다.' };
    }
}

/**
 * 주문 상태 변경 및 후속 처리
 * @param orderId 주문 ID
 * @param newStatus 변경할 상태 (예: 'delivered', 'cancelled')
 */
export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        // 상태 전이에 따른 복합 로직 구현 필요 (배송완료 시 포인트 최종 차감 등)
        await query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, orderId]);
        revalidatePath('/store/orders');
        return { success: true };
    } catch (error) {
        console.error('Status update failed:', error);
        return { success: false, error: '상태 변경 중 오류가 발생했습니다.' };
    }
}
