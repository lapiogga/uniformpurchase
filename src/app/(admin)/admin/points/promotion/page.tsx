'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PromotionPointPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGrantBonus = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // Mocking the server action for now
        setTimeout(() => {
            toast.success('진급 보너스가 성공적으로 지급되었습니다.');
            setLoading(false);
            router.push('/admin/points');
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">진급자 추가 포인트 지급</h2>
                    <p className="text-sm text-zinc-500">계급 승진에 따른 차액 포인트를 수동으로 지급합니다.</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-lg">대상자 검색 및 지급</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGrantBonus} className="space-y-4">
                        <div className="space-y-2">
                            <Label>대상자 검색 (성명 또는 군번)</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    placeholder="예: 홍길동"
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>현 계급</Label>
                                <Input disabled value="중사 (상사 진급)" className="bg-zinc-50" />
                            </div>
                            <div className="space-y-2">
                                <Label>지급 포인트</Label>
                                <Input type="number" defaultValue={100000} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>비고 (지급 사유)</Label>
                            <Input placeholder="예: 2026-03-01 상사 진급에 따른 차액 지급" />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>뒤로가기</Button>
                            <Button type="submit" className="bg-[#1d4ed8]" disabled={loading || !search}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                {loading ? '처리 중...' : '보너스 지급 확정'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
