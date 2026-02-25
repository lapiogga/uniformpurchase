'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createFeedback(data: {
    userId?: string;
    userName: string;
    userEmail: string;
    content: string;
}) {
    try {
        await query(
            `INSERT INTO feedbacks (user_id, user_name, user_email, content)
             VALUES ($1, $2, $3, $4)`,
            [data.userId || null, data.userName, data.userEmail, data.content]
        );
        return { success: true };
    } catch (error) {
        console.error('Error creating feedback:', error);
        return { success: false, error: '의견 제출 중 오류가 발생했습니다.' };
    }
}

export async function getFeedbacks() {
    try {
        const result = await query(
            `SELECT f.*, u.name as real_user_name, u.rank 
             FROM feedbacks f
             LEFT JOIN users u ON f.user_id = u.id
             ORDER BY f.created_at DESC`
        );
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        return { success: false, error: '의견 목록을 가져오는 중 오류가 발생했습니다.' };
    }
}

export async function replyFeedback(id: string, replyContent: string) {
    try {
        await query(
            `UPDATE feedbacks 
             SET reply_content = $1, status = 'replied', replied_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [replyContent, id]
        );
        revalidatePath('/admin/feedbacks');
        return { success: true };
    } catch (error) {
        console.error('Error replying to feedback:', error);
        return { success: false, error: '회신 등록 중 오류가 발생했습니다.' };
    }
}
