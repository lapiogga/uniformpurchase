'use client';

import { useState, useEffect } from 'react';
import { getFeedbacks, replyFeedback } from '@/actions/feedbacks';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        const res = await getFeedbacks();
        if (res.success) {
            setFeedbacks(res.data || []);
        }
        setLoading(false);
    };

    const handleReply = async (id: string) => {
        if (!replyText.trim()) return;
        const res = await replyFeedback(id, replyText);
        if (res.success) {
            toast.success('회신이 등록되었습니다.');
            setReplyingId(null);
            setReplyText('');
            fetchFeedbacks();
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">의견수렴 및 고객문의</h1>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Clock className="h-10 w-10 text-zinc-200 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {feedbacks.length === 0 ? (
                        <div className="bg-white p-20 text-center rounded-xl border-2 border-dashed border-zinc-100 italic text-zinc-400">
                            접수된 의견이 없습니다.
                        </div>
                    ) : (
                        feedbacks.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl border border-zinc-100 overflow-hidden shadow-sm">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center",
                                                item.status === 'replied' ? "bg-blue-50 text-blue-600" : "bg-zinc-50 text-zinc-400"
                                            )}>
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-zinc-900">{item.user_name || '비회원'}</h3>
                                                <p className="text-xs text-zinc-400">{item.user_email} • {format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                            item.status === 'replied' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {item.status === 'replied' ? '회신완료' : '검토중'}
                                        </span>
                                    </div>
                                    <div className="pl-13 py-4 bg-zinc-50/50 rounded-lg p-4 italic text-zinc-600">
                                        {item.content}
                                    </div>

                                    {item.reply_content ? (
                                        <div className="mt-6 pl-6 border-l-4 border-blue-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">담당자 답변</span>
                                                <span className="text-[10px] text-zinc-300 ml-auto">{format(new Date(item.replied_at), 'yyyy-MM-dd HH:mm')}</span>
                                            </div>
                                            <p className="text-sm text-zinc-700 leading-relaxed font-dream">
                                                {item.reply_content}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mt-6 flex flex-col gap-3">
                                            {replyingId === item.id ? (
                                                <div className="space-y-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                                    <textarea
                                                        className="w-full bg-white border border-blue-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded font-dream"
                                                        rows={4}
                                                        placeholder="회신 내용을 입력하세요..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setReplyingId(null)}
                                                            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600"
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            onClick={() => handleReply(item.id)}
                                                            className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded flex items-center gap-2"
                                                        >
                                                            <Send className="h-3 w-3" />
                                                            회신 등록
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setReplyingId(item.id)}
                                                    className="w-fit text-xs font-bold text-zinc-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                                                >
                                                    <Send className="h-3 w-3" />
                                                    회신 작성하기
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
