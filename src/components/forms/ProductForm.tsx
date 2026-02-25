'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { upsertProduct, getCategories } from '@/actions/products';

import { ProductSpecModal } from './ProductSpecModal';

export function ProductForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [specModalOpen, setSpecModalOpen] = useState(false);

    // 계층형 카테고리 상태
    const [selectedLarge, setSelectedLarge] = useState<string>('');
    const [selectedMedium, setSelectedMedium] = useState<string>('');
    const [selectedSmall, setSelectedSmall] = useState<string>('');

    useEffect(() => {
        async function loadCategories() {
            const res = await getCategories();
            if (res.success && res.data) {
                setAllCategories(res.data);

                // 초기 데이터가 있으면 계층 복원
                if (initialData?.category_id) {
                    const currentCat = res.data.find((c: any) => c.id === initialData.category_id);
                    if (currentCat) {
                        if (currentCat.level === 3) {
                            setSelectedSmall(currentCat.id);
                            setSelectedMedium(currentCat.parent_id);
                            const midCat = res.data.find((c: any) => c.id === currentCat.parent_id);
                            if (midCat) setSelectedLarge(midCat.parent_id);
                        } else if (currentCat.level === 2) {
                            setSelectedMedium(currentCat.id);
                            setSelectedLarge(currentCat.parent_id);
                        } else {
                            setSelectedLarge(currentCat.id);
                        }
                    }
                }
            }
        }
        loadCategories();
    }, [initialData]);

    const largeCategories = allCategories.filter(c => c.level === 1);
    const mediumCategories = allCategories.filter(c => c.level === 2 && c.parent_id === selectedLarge);
    const smallCategories = allCategories.filter(c => c.level === 3 && c.parent_id === selectedMedium);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 최종 선택된 카테고리 ID (Small -> Medium -> Large 순으로 우선순위)
        const finalCategoryId = selectedSmall || selectedMedium || selectedLarge;

        if (!finalCategoryId) {
            toast.error("카테고리를 선택해주세요.");
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const result = await upsertProduct({
                ...data,
                id: isEdit ? initialData.id : undefined,
                category_id: finalCategoryId,
                base_price: Number(data.base_price),
            });

            if (result.success) {
                toast.success(isEdit ? '품목 정보가 수정되었습니다.' : '품목이 등록되었습니다.');
                if (!isEdit) {
                    router.push('/admin/products');
                }
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
        <>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl bg-white p-8 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-zinc-800">품목 정보 입력</h3>
                    {isEdit && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSpecModalOpen(true)}
                            className="bg-zinc-800 text-white hover:bg-zinc-700 border-none h-8 text-xs font-bold"
                        >
                            규격(사이즈) 관리
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="name" className="font-bold">품목명</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={initialData?.name}
                            required
                            placeholder="예: 전투복 상의"
                            className="h-11 border-zinc-200"
                        />
                    </div>

                    {/* 계층형 카테고리 선택 */}
                    <div className="space-y-2 col-span-2">
                        <Label className="font-bold">카테고리 지정</Label>
                        <div className="grid grid-cols-3 gap-3">
                            <select
                                value={selectedLarge}
                                onChange={(e) => {
                                    setSelectedLarge(e.target.value);
                                    setSelectedMedium('');
                                    setSelectedSmall('');
                                }}
                                className="h-10 px-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                required
                            >
                                <option value="">대분류 선택</option>
                                {largeCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <select
                                value={selectedMedium}
                                onChange={(e) => {
                                    setSelectedMedium(e.target.value);
                                    setSelectedSmall('');
                                }}
                                className="h-10 px-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                disabled={!selectedLarge}
                            >
                                <option value="">중분류 선택</option>
                                {mediumCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <select
                                value={selectedSmall}
                                onChange={(e) => setSelectedSmall(e.target.value)}
                                className="h-10 px-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                disabled={!selectedMedium}
                            >
                                <option value="">소분류 선택</option>
                                {smallCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product_type" className="font-bold">품목 유형</Label>
                        <select
                            id="product_type"
                            name="product_type"
                            defaultValue={initialData?.product_type || 'finished'}
                            className="w-full h-11 px-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="finished">완제품</option>
                            <option value="custom">맞춤피복</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="base_price" className="font-bold">기준 가격 (P)</Label>
                        <Input
                            id="base_price"
                            name="base_price"
                            type="number"
                            defaultValue={initialData?.base_price}
                            required
                            placeholder="0"
                            className="h-11 border-zinc-200"
                        />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="image_url" className="font-bold">이미지 URL</Label>
                        <Input
                            id="image_url"
                            name="image_url"
                            defaultValue={initialData?.image_url}
                            placeholder="https://images.unsplash.com/..."
                            className="h-11 border-zinc-200"
                        />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="description" className="font-bold">상세 설명</Label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={initialData?.description}
                            className="w-full min-h-[100px] p-3 rounded-md border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="품목에 대한 상세 설명을 입력하세요."
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-6 border-t mt-6">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 px-6 font-bold">취소</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-11 px-8 font-extrabold shadow-md" disabled={loading}>
                        {loading ? '저장 중...' : (isEdit ? '수정완료' : '품목 등록하기')}
                    </Button>
                </div>
            </form>

            {isEdit && (
                <ProductSpecModal
                    isOpen={specModalOpen}
                    onClose={() => setSpecModalOpen(false)}
                    productId={initialData.id}
                    productName={initialData.name}
                />
            )}
        </>
    );
}
