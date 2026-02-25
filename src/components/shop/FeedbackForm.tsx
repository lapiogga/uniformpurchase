'use client';

import { useState } from 'react';
import { createFeedback } from '@/actions/feedbacks';
import { toast } from 'sonner';

interface FeedbackFormProps {
    userId?: string;
}

export function FeedbackForm({ userId }: FeedbackFormProps) {
    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await createFeedback({ ...formData, userId });
        if (res.success) {
            toast.success('의견이 소중히 접수되었습니다.');
            setFormData({ userName: '', userEmail: '', content: '' });
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <input
                    required
                    placeholder="성함"
                    className="bg-black/20 border border-white/20 p-4 font-bold text-sm focus:outline-none focus:border-[#ed786a] text-white"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                />
                <input
                    required
                    type="email"
                    placeholder="이메일"
                    className="bg-black/20 border border-white/20 p-4 font-bold text-sm focus:outline-none focus:border-[#ed786a] text-white"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                />
            </div>
            <textarea
                required
                placeholder="메시지 내용을 입력하세요"
                rows={4}
                className="w-full bg-black/20 border border-white/20 p-4 font-bold text-sm focus:outline-none focus:border-[#ed786a] text-white"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[#ed786a] text-white font-black tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
                {loading ? '전송 중...' : '메시지 보내기'}
            </button>
        </form>
    );
}
