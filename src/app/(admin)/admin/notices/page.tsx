'use client';

import { useState, useEffect } from 'react';
import { getNotices, createNotice, deleteNotice, updateNotice } from '@/actions/notices';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Bell, Plus, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NoticeManagementPage() {
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPriority: false
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        setLoading(true);
        const res = await getNotices();
        if (res.success) {
            setNotices(res.data);
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await createNotice(formData);
        if (res.success) {
            toast.success('공지사항이 등록되었습니다.');
            setIsCreating(false);
            setFormData({ title: '', content: '', isPriority: false });
            fetchNotices();
        } else {
            toast.error(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('공지사항을 삭제하시겠습니까?')) return;
        const res = await deleteNotice(id);
        if (res.success) {
            toast.success('공지사항이 삭제되었습니다.');
            fetchNotices();
        } else {
            toast.error(res.error);
        }
    };

    const togglePriority = async (id: string, current: boolean) => {
        const res = await updateNotice(id, { isPriority: !current });
        if (res.success) {
            fetchNotices();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">공지사항 관리</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-[#222] text-white px-6 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-black transition-all"
                >
                    <Plus className="h-4 w-4" />
                    새 공지 작성
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-8 rounded-xl border-2 border-[#222]/5 shadow-sm">
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">제목</label>
                            <input
                                required
                                className="w-full bg-zinc-50 border-none p-4 text-sm focus:ring-2 focus:ring-[#ed786a] rounded"
                                placeholder="공지사항 제목을 입력하세요"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">내용</label>
                            <textarea
                                required
                                className="w-full bg-zinc-50 border-none p-4 text-sm focus:ring-2 focus:ring-[#ed786a] rounded h-40 font-dream"
                                placeholder="공지사항 내용을 상세히 작성하세요"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="priority"
                                checked={formData.isPriority}
                                onChange={(e) => setFormData({ ...formData, isPriority: e.target.checked })}
                                className="h-4 w-4 accent-[#ed786a]"
                            />
                            <label htmlFor="priority" className="text-sm font-bold text-zinc-600">중요 공지로 고정 (상단 노출)</label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-2 text-sm font-bold text-zinc-400"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2 bg-[#ed786a] text-white text-sm font-black rounded uppercase tracking-widest"
                            >
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] w-16">중요</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">제목</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] w-32">작성일</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] w-40 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {loading ? (
                            <tr><td colSpan={4} className="py-20 text-center text-zinc-300 italic">공지사항을 불러오는 중...</td></tr>
                        ) : notices.length === 0 ? (
                            <tr><td colSpan={4} className="py-20 text-center text-zinc-300 italic">등록된 공지사항이 없습니다.</td></tr>
                        ) : notices.map((notice) => (
                            <tr key={notice.id} className="hover:bg-zinc-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <button onClick={() => togglePriority(notice.id, notice.is_priority)}>
                                        {notice.is_priority ? (
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-zinc-200 hover:text-red-200" />
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className={cn("font-bold text-zinc-900 truncate", notice.is_priority && "text-red-600")}>
                                            {notice.title}
                                        </p>
                                        <p className="text-xs text-zinc-400 line-clamp-1">{notice.content}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-zinc-500">
                                    {format(new Date(notice.created_at), 'yyyy-MM-dd')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-zinc-400 hover:text-blue-500">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(notice.id)}
                                            className="p-2 text-zinc-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
