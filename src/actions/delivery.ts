'use server'

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 직접 배송지 목록 조회
 */
export async function getDeliveryZones(storeId: string) {
    try {
        const result = await query(
            'SELECT * FROM delivery_zones WHERE store_id = $1 AND is_active = true ORDER BY zone_name ASC',
            [storeId]
        );
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Failed to fetch delivery zones:', error);
        return { success: false, error: '배송지 목록을 불러오는 중 오류가 발생했습니다.' };
    }
}

/**
 * 직접 배송지 추가/수정
 */
export async function upsertDeliveryZone(data: {
    id?: string;
    storeId: string;
    zoneName: string;
    address: string;
    note?: string;
}) {
    try {
        if (data.id) {
            await query(`
                UPDATE delivery_zones 
                SET zone_name = $1, address = $2, note = $3, updated_at = NOW()
                WHERE id = $4
            `, [data.zoneName, data.address, data.note, data.id]);
        } else {
            await query(`
                INSERT INTO delivery_zones (store_id, zone_name, address, note)
                VALUES ($1, $2, $3, $4)
            `, [data.storeId, data.zoneName, data.address, data.note]);
        }
        revalidatePath('/store/delivery');
        return { success: true };
    } catch (error) {
        console.error('Failed to upsert delivery zone:', error);
        return { success: false, error: '배송지 저장 중 오류가 발생했습니다.' };
    }
}

/**
 * 직접 배송지 삭제 (비활성화)
 */
export async function deleteDeliveryZone(id: string) {
    try {
        await query('UPDATE delivery_zones SET is_active = false WHERE id = $1', [id]);
        revalidatePath('/store/delivery');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete delivery zone:', error);
        return { success: false, error: '배송지 삭제 중 오류가 발생했습니다.' };
    }
}
