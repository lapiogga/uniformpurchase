'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { requestSettlement } from '@/actions/settlements';

export function SettlementRequestButton({
    tailorId,
    disabled
}: {
    tailorId: string;
    disabled?: boolean;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        if (!confirm('정산 요청을 하시겠습니까? 등록된 모든 체척권이 정산 요청 상태로 변경됩니다.')) return;

        setLoading(true);
        try {
            const res = await requestSettlement(tailorId);
            if (res.success) {
                toast.success('정산 요청이 성공적으로 완료되었습니다.');
                router.refresh();
            } else {
                toast.error(res.error || '정산 요청 실패');
            }
        } catch (error) {
            toast.error('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleRequest}
            disabled={disabled || loading}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5"
        >
            <CreditCard className="h-4 w-4" />
            {loading ? '처리 중...' : '정산 요청'}
        </Button>
    );
}
