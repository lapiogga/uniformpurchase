'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function StoreForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // Mock saving
        setTimeout(() => {
            toast.success(isEdit ? '판매소 정보가 수정되었습니다.' : '판매소가 등록되었습니다.');
            router.push('/admin/stores');
            router.refresh();
            setLoading(false);
        }, 800);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">판매소명</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={initialData?.name}
                        required
                        placeholder="예: 제1보병사단 판매소"
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">주소</Label>
                    <Input
                        id="address"
                        name="address"
                        defaultValue={initialData?.address}
                        required
                        placeholder="부대 내 위치 또는 상세 주소"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contact">연락처</Label>
                    <Input
                        id="contact"
                        name="contact"
                        defaultValue={initialData?.contact}
                        placeholder="031-123-4567"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="manager_name">담당자명</Label>
                    <Input
                        id="manager_name"
                        name="manager_name"
                        defaultValue={initialData?.manager_name}
                        placeholder="성명 입력"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="is_active">운영 상태</Label>
                    <select
                        id="is_active"
                        name="is_active"
                        defaultValue={String(initialData?.is_active ?? true)}
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 text-sm outline-none"
                    >
                        <option value="true">운영중</option>
                        <option value="false">운영중지</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
                <Button type="submit" className="bg-[#1d4ed8]" disabled={loading}>
                    {loading ? '저장 중...' : (isEdit ? '수정완료' : '등록하기')}
                </Button>
            </div>
        </form>
    );
}
