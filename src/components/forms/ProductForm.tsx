'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { upsertProduct, getCategories } from '@/actions/products';

export function ProductForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        async function loadCategories() {
            const res = await getCategories();
            if (res.success && res.data) {
                setCategories(res.data);
            }
        }
        loadCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const result = await upsertProduct({
                ...data,
                id: isEdit ? initialData.id : undefined,
                base_price: Number(data.base_price),
            });

            if (result.success) {
                toast.success(isEdit ? '품목 정보가 수정되었습니다.' : '품목이 등록되었습니다.');
                router.push('/admin/products');
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
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">품목명</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={initialData?.name}
                        required
                        placeholder="예: 전투복 상의"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category_id">카테고리</Label>
                    <select
                        id="category_id"
                        name="category_id"
                        defaultValue={initialData?.category_id}
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">카테고리 선택</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product_type">품목 유형</Label>
                    <select
                        id="product_type"
                        name="product_type"
                        defaultValue={initialData?.product_type || 'finished'}
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="finished">완제품</option>
                        <option value="custom">맞춤피복</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="base_price">기준 가격 (포인트)</Label>
                    <Input
                        id="base_price"
                        name="base_price"
                        type="number"
                        defaultValue={initialData?.base_price}
                        required
                        placeholder="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="image_url">이미지 URL (선택사항)</Label>
                    <Input
                        id="image_url"
                        name="image_url"
                        defaultValue={initialData?.image_url}
                        placeholder="https://..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">상세 설명</Label>
                    <textarea
                        id="description"
                        name="description"
                        defaultValue={initialData?.description}
                        className="w-full min-h-[100px] p-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="품목에 대한 설명을 입력하세요."
                    />
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
