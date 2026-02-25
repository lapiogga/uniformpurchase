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
            const itemResult = await query(`
                INSERT INTO order_items (order_id, product_id, spec_id, quantity, unit_price, subtotal)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [orderId, item.productId, item.specId, item.quantity, item.unitPrice, item.unitPrice * item.quantity]);
            const orderItemId = itemResult.rows[0].id;

            // 6. 맞춤피복 주문 시 체척권(Tailoring Ticket) 자동 발행 (BR-030)
            if (orderData.productType === 'custom') {
                for (let i = 0; i < item.quantity; i++) {
                    const ticketDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                    const ticketSeqResult = await query("SELECT nextval('ticket_number_seq')");
                    const ticketNumber = `TKT-${ticketDate}-${ticketSeqResult.rows[0].nextval.toString().padStart(5, '0')}`;

                    await query(`
                        INSERT INTO tailoring_tickets (ticket_number, user_id, order_item_id, status)
                        VALUES ($1, $2, $3, 'issued')
                    `, [ticketNumber, orderData.userId, orderItemId]);
                }
            }
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
 * 최근 주문 내역 조회 (판매소용)
 */
export async function getRecentOrders(storeId: string, limit: number = 10) {
    try {
        const result = await query(`
            SELECT o.*, u.name as user_name, u.rank, u.military_number
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.store_id = $1
            ORDER BY o.created_at DESC
            LIMIT $2
        `, [storeId, limit]);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return { success: false, error: '주문 내역을 불러오는 중 오류가 발생했습니다.' };
    }
}
/**
 * 오프라인 판매 등록 (REQ-S-001, REQ-S-002)
 * @param data 사용자 ID, 판매소 ID, 판매 항목 등
 */
export async function createOfflineOrder(data: {
    userId: string;
    storeId: string;
    items: { productId: string; specId: string; quantity: number; unitPrice: number }[];
}) {
    try {
        const totalAmount = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

        // 1. 가용 포인트 확인
        const summaryResult = await query(
            'SELECT (total_granted - used_points - reserved_points) as available FROM point_summary WHERE user_id = $1',
            [data.userId]
        );
        if (!summaryResult.rows[0] || summaryResult.rows[0].available < totalAmount) {
            return { success: false, error: '가용 포인트가 부족합니다.' };
        }

        await query('BEGIN');

        // 2. 주문 생성 (offline, delivered)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const seqResult = await query("SELECT nextval('order_number_seq')");
        const orderNumber = `OFF-${dateStr}-${seqResult.rows[0].nextval.toString().padStart(5, '0')}`;

        const orderResult = await query(`
            INSERT INTO orders (order_number, user_id, store_id, order_type, product_type, status, total_amount)
            VALUES ($1, $2, $3, 'offline', $4, 'delivered', $5)
            RETURNING id
        `, [orderNumber, data.userId, data.storeId, 'finished', totalAmount]); // Default to finished for offline
        const orderId = orderResult.rows[0].id;

        // 3. 상세 항목 및 재고 차감
        for (const item of data.items) {
            await query(`
                INSERT INTO order_items (order_id, product_id, spec_id, quantity, unit_price, subtotal)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [orderId, item.productId, item.specId, item.quantity, item.unitPrice, item.unitPrice * item.quantity]);

            // 재고 차감
            const invResult = await query(
                'UPDATE inventory SET quantity = quantity - $1, updated_at = NOW() WHERE store_id = $2 AND product_id = $3 AND spec_id = $4 RETURNING id, quantity',
                [item.quantity, data.storeId, item.productId, item.specId]
            );

            if (invResult.rows.length > 0) {
                // 이력 남기기
                await query(`
                    INSERT INTO inventory_log (inventory_id, change_type, change_quantity, balance_after, reason)
                    VALUES ($1, 'sale', $2, $3, $4)
                `, [invResult.rows[0].id, -item.quantity, invResult.rows[0].quantity, `오프라인 판매: ${orderNumber}`]);
            }
        }

        // 4. 포인트 최종 차감 (사용액 증가)
        await query(`
            INSERT INTO point_ledger (user_id, point_type, amount, reference_type, reference_id, description)
            VALUES ($1, 'use', $2, 'order', $3, '오프라인 구매 포인트 사용')
        `, [data.userId, totalAmount, orderId]);

        await query(`
            UPDATE point_summary 
            SET used_points = used_points + $1, updated_at = NOW()
            WHERE user_id = $2
        `, [totalAmount, data.userId]);

        await query('COMMIT');
        revalidatePath('/store/inventory');
        revalidatePath('/store/dashboard');
        return { success: true, orderNumber };
    } catch (error) {
        await query('ROLLBACK');
        console.error('Offline order failed:', error);
        return { success: false, error: '판매 처리 중 오류가 발생했습니다.' };
    }
}

/**
 * 판매 현황 목록 조회 (REQ-S-010)
 */
export async function getSalesHistory(storeId: string, filters?: { search?: string }) {
    try {
        let sql = `
            SELECT o.*, u.name as user_name, u.rank, u.military_number
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.store_id = $1
        `;
        const params: any[] = [storeId];

        if (filters?.search) {
            params.push(`%${filters.search}%`);
            sql += ` AND (u.name ILIKE $${params.length} OR u.military_number ILIKE $${params.length} OR o.order_number ILIKE $${params.length})`;
        }

        sql += ` ORDER BY o.created_at DESC`;
        const result = await query(sql, params);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch sales history:', error);
        return { success: false, error: '판매 내역을 불러오는 중 오류가 발생했습니다.' };
    }
}

/**
 * 반품 처리 (포인트 반환 및 재고 복구)
 */
export async function processReturn(orderId: string, reason: string) {
    try {
        const orderResult = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (orderResult.rows.length === 0) throw new Error('Order not found');
        const order = orderResult.rows[0];

        if (order.status === 'returned') return { success: false, error: '이미 반품된 주문입니다.' };

        await query('BEGIN');

        // 1. 주문 상태 업데이트
        await query("UPDATE orders SET status = 'returned', updated_at = NOW() WHERE id = $1", [orderId]);

        // 2. 포인트 반환
        await query(`
            INSERT INTO point_ledger (user_id, point_type, amount, reference_type, reference_id, description)
            VALUES ($1, 'grant', $2, 'return', $3, $4)
        `, [order.user_id, order.total_amount, orderId, `반품 처리 포인트 반환: ${order.order_number}`]);

        await query(`
            UPDATE point_summary 
            SET used_points = used_points - $1, updated_at = NOW()
            WHERE user_id = $2
        `, [order.total_amount, order.user_id]);

        // 3. 재고 복구 (오프라인 판매였던 경우)
        if (order.order_type === 'offline') {
            const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
            for (const item of itemsResult.rows) {
                const invResult = await query(
                    'UPDATE inventory SET quantity = quantity + $1, updated_at = NOW() WHERE store_id = $2 AND product_id = $3 AND spec_id = $4 RETURNING id, quantity',
                    [item.quantity, order.store_id, item.product_id, item.spec_id]
                );

                if (invResult.rows.length > 0) {
                    await query(`
                        INSERT INTO inventory_log (inventory_id, change_type, change_quantity, balance_after, reason)
                        VALUES ($1, 'return', $2, $3, $4)
                    `, [invResult.rows[0].id, item.quantity, invResult.rows[0].quantity, `판매 반품: ${order.order_number}`]);
                }
            }
        }

        await query('COMMIT');
        revalidatePath('/store/sales');
        revalidatePath('/store/inventory');
        revalidatePath('/store/dashboard');
        return { success: true };
    } catch (error) {
        await query('ROLLBACK');
        console.error('Return process failed:', error);
        return { success: false, error: '반품 처리 중 오류가 발생했습니다.' };
    }
}

