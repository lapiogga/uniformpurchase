'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Coins, UserCheck, Eye } from 'lucide-react';
import { grantAnnualPoints } from '@/actions/points';
import { toast } from 'sonner';
import Link from 'next/link';

export function PointActionButtons({ currentYear }: { currentYear: number }) {
    const [loading, setLoading] = useState(false);

    const handleGrantPoints = async () => {
        if (!confirm(`${currentYear}년 정기 포인트를 일괄 지급하시겠습니까?`)) return;

        setLoading(true);
        try {
            const result = await grantAnnualPoints(currentYear);
            if (result.success) {
                toast.success('포인트 지급이 완료되었습니다.');
            } else {
                toast.error(result.error || '지급 중 오류가 발생했습니다.');
            }
        } catch (error) {
            toast.error('통신 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => toast.info('산정 결과 미리보기 기능 준비 중입니다.')}
            >
                <Eye className="mr-2 h-4 w-4" />
                산정 미리보기
            </Button>
            <Link href="/admin/points/promotion">
                <Button variant="outline" className="gap-1.5">
                    <UserCheck className="h-4 w-4" />
                    진급자 추가지급
                </Button>
            </Link>
            <Button
                className="bg-[#1d4ed8]"
                onClick={handleGrantPoints}
                disabled={loading}
            >
                <Coins className="mr-2 h-4 w-4" />
                {loading ? '지급 중...' : `${currentYear}년 정기 포인트 지급`}
            </Button>
        </div>
    );
}
