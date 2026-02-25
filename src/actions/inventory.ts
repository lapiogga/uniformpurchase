'use server'

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 특정 판매소의 재고 목록 조회
 * @param storeId 판매소 ID
 * @param filters 필터 옵션 (카테고리, 검색어)
 */
export async function getInventory(storeId: string, filters?: { categoryId?: string; search?: string }) {
    try {
        // 품목 정보, 규격 정보, 카테고리명을 포함한 조인 쿼리
        let sql = `
      SELECT 
        i.*, 
        p.name as product_name, 
        p.product_type,
        p.base_price as price,
        ps.spec_name,
        c.name as category_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN product_specs ps ON i.spec_id = ps.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE i.store_id = $1
    `;
        const params: any[] = [storeId];

        // 카테고리 필터링 적용
        if (filters?.categoryId) {
            params.push(filters.categoryId);
            sql += ` AND p.category_id = $${params.length}`;
        }

        // 품목명 검색 적용 (대소문자 구분 없음)
        if (filters?.search) {
            params.push(`%${filters.search}%`);
            sql += ` AND p.name ILIKE $${params.length}`;
        }

        sql += ' ORDER BY p.name ASC, ps.sort_order ASC';

        const result = await query(sql, params);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch inventory:', error);
        return { success: false, error: '재고 정보를 불러오는 중 오류가 발생했습니다.' };
    }
}

/**
 * 재고 조정 처리 (입고, 조정 등)
 * @param data 재고 ID, 변경 수량, 조정 타입, 사유
 */
export async function adjustInventory(data: {
    inventoryId: string;
    changeQuantity: number;
    type: 'incoming' | 'adjust_up' | 'adjust_down';
    reason?: string;
}) {
    try {
        // 1. 현재 재고량 확인
        const currentResult = await query('SELECT quantity FROM inventory WHERE id = $1', [data.inventoryId]);
        if (currentResult.rows.length === 0) throw new Error('Inventory not found');

        const currentQty = currentResult.rows[0].quantity;
        const newQty = currentQty + data.changeQuantity;

        // 마이너스 재고 방지 로직
        if (newQty < 0) {
            return { success: false, error: '조정 후 재고는 0보다 작을 수 없습니다.' };
        }

        // 2. 재고 업데이트 및 이력 로그 저장을 트랜잭션으로 처리
        await query('BEGIN');

        // 재고 수량 업데이트
        await query('UPDATE inventory SET quantity = $1, updated_at = NOW() WHERE id = $2', [newQty, data.inventoryId]);

        // 재고 변동 이력(Log) 저장
        await query(`
      INSERT INTO inventory_log (inventory_id, change_type, change_quantity, balance_after, reason)
      VALUES ($1, $2, $3, $4, $5)
    `, [data.inventoryId, data.type, data.changeQuantity, newQty, data.reason]);

        await query('COMMIT');

        // 재고 페이지 캐시 갱신
        revalidatePath('/store/inventory');
        return { success: true };
    } catch (error) {
        // 오류 발생 시 중단된 트랜잭션 롤백
        await query('ROLLBACK');
        console.error('Failed to adjust inventory:', error);
        return { success: false, error: '재고 조정 중 오류가 발생했습니다.' };
    }
}

/**
 * 특정 재고의 최근 변동 이력 조회
 */
export async function getInventoryLog(inventoryId: string) {
    try {
        const result = await query(`
      SELECT * FROM inventory_log 
      WHERE inventory_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [inventoryId]);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch inventory logs:', error);
        return { success: false, error: '변동 이력을 불러오는 중 오류가 발생했습니다.' };
    }
}
