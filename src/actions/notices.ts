'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createNotice(data: {
    title: string;
    content: string;
    isPriority?: boolean;
}) {
    try {
        await query(
            `INSERT INTO notices (title, content, is_priority)
             VALUES ($1, $2, $3)`,
            [data.title, data.content, data.isPriority || false]
        );
        revalidatePath('/admin/notices');
        return { success: true };
    } catch (error) {
        console.error('Error creating notice:', error);
        return { success: false, error: '공지사항 작성 중 오류가 발생했습니다.' };
    }
}

export async function getNotices(limit?: number) {
    try {
        const result = await query(
            `SELECT * FROM notices 
             WHERE is_active = true 
             ORDER BY is_priority DESC, created_at DESC
             ${limit ? `LIMIT ${limit}` : ''}`
        );
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching notices:', error);
        return { success: false, error: '공지사항을 가져오는 중 오류가 발생했습니다.' };
    }
}

export async function updateNotice(id: string, data: {
    title?: string;
    content?: string;
    isPriority?: boolean;
    isActive?: boolean;
}) {
    try {
        const fields: string[] = [];
        const values: any[] = [];
        let i = 1;

        if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title); }
        if (data.content !== undefined) { fields.push(`content = $${i++}`); values.push(data.content); }
        if (data.isPriority !== undefined) { fields.push(`is_priority = $${i++}`); values.push(data.isPriority); }
        if (data.isActive !== undefined) { fields.push(`is_active = $${i++}`); values.push(data.isActive); }

        values.push(id);
        await query(
            `UPDATE notices SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i}`,
            values
        );
        revalidatePath('/admin/notices');
        return { success: true };
    } catch (error) {
        console.error('Error updating notice:', error);
        return { success: false, error: '공지사항 수정 중 오류가 발생했습니다.' };
    }
}

export async function deleteNotice(id: string) {
    try {
        await query(`DELETE FROM notices WHERE id = $1`, [id]);
        revalidatePath('/admin/notices');
        return { success: true };
    } catch (error) {
        console.error('Error deleting notice:', error);
        return { success: false, error: '공지사항 삭제 중 오류가 발생했습니다.' };
    }
}
