'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createUser, updateUser } from '@/actions/users';

const rankOptions = [
    { value: 'general', label: '장성' },
    { value: 'colonel', label: '대령' },
    { value: 'lt_colonel', label: '중령' },
    { value: 'major', label: '소령' },
    { value: 'captain', label: '대위' },
    { value: 'first_lt', label: '중위' },
    { value: 'second_lt', label: '소위' },
    { value: 'warrant', label: '준위' },
    { value: 'sgt_major', label: '원사' },
    { value: 'master_sgt', label: '상사' },
    { value: 'sgt', label: '중사' },
    { value: 'civil_servant', label: '군무원' },
];

const roleOptions = [
    { value: 'user', label: '일반사용자' },
    { value: 'admin', label: '군수담당자' },
    { value: 'store', label: '피복판매소' },
    { value: 'tailor', label: '체척업체' },
];

interface UserFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function UserForm({ initialData, isEdit }: UserFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            let result;
            if (isEdit) {
                result = await updateUser(initialData.id, {
                    ...data,
                    is_active: data.is_active === 'true'
                });
            } else {
                // For mock creation, we generate a random ID
                const id = crypto.randomUUID();
                result = await createUser({
                    ...data,
                    id,
                    role: data.role as any,
                });
            }

            if (result.success) {
                toast.success(isEdit ? '사용자 정보가 수정되었습니다.' : '사용자가 등록되었습니다.');
                router.push('/admin/users');
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="military_number">군번</Label>
                    <Input
                        id="military_number"
                        name="military_number"
                        defaultValue={initialData?.military_number}
                        required
                        placeholder="예: 24-123456"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rank">계급</Label>
                    <select
                        id="rank"
                        name="rank"
                        defaultValue={initialData?.rank || 'sgt'}
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        {rankOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">권한 역할</Label>
                    <select
                        id="role"
                        name="role"
                        defaultValue={initialData?.role || 'user'}
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        required
                    >
                        {roleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={initialData?.name}
                        required
                        placeholder="홍길동"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unit">소속</Label>
                    <Input
                        id="unit"
                        name="unit"
                        defaultValue={initialData?.unit}
                        required
                        placeholder="예: 제1보병사단"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={initialData?.email}
                        required={!isEdit}
                        disabled={isEdit}
                        placeholder="email@example.com"
                    />
                </div>
                {isEdit && (
                    <div className="space-y-2">
                        <Label htmlFor="is_active">상태</Label>
                        <select
                            id="is_active"
                            name="is_active"
                            defaultValue={String(initialData?.is_active ?? true)}
                            className="w-full h-10 px-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="true">활성</option>
                            <option value="false">비활성</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    취소
                </Button>
                <Button
                    type="submit"
                    className="bg-[#1d4ed8]"
                    disabled={loading}
                >
                    {loading ? '저장 중...' : (isEdit ? '수정완료' : '등록하기')}
                </Button>
            </div>
        </form>
    );
}
