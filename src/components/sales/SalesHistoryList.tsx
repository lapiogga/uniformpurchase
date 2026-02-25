'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, User, ExternalLink } from "lucide-react";
import { formatCurrency, cn, getRankLabel } from "@/lib/utils";
import { toast } from "sonner";
import { processReturn } from "@/actions/orders";

export function SalesHistoryList({
    initialOrders
}: {
    initialOrders: any[]
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [loading, setLoading] = useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set('search', search); else params.delete('search');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleReturn = async (orderId: string, orderNumber: string) => {
        const reason = prompt(`[${orderNumber}] 반품 사유를 입력하세요:`);
        if (!reason) return;

        if (!confirm("정말로 반품 처리하시겠습니까? 포인트와 재고가 원복됩니다.")) return;

        setLoading(orderId);
        try {
            const res = await processReturn(orderId, reason);
            if (res.success) {
                toast.success("반품 처리가 완료되었습니다.");
                router.refresh();
            } else {
                toast.error(res.error || "반품 처리 실패");
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setLoading(null);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">판매 현황 및 반품 관리</h2>
                    <p className="text-sm text-zinc-500">전체 판매 내역을 조회하고 반품 처리를 수행합니다.</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="주문자 성명, 군번, 또는 주문번호로 검색..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button type="submit">검색</Button>
            </form>

            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="pl-6">주문번호 / 일시</TableHead>
                            <TableHead>주문자 정보</TableHead>
                            <TableHead>유형</TableHead>
                            <TableHead className="text-right">결제 금액</TableHead>
                            <TableHead className="text-center">상태</TableHead>
                            <TableHead className="text-right pr-6">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-zinc-400">
                                    판매 내역이 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialOrders.map((order: any) => (
                                <TableRow key={order.id} className="hover:bg-zinc-50/50">
                                    <TableCell className="pl-6 py-4">
                                        <div className="font-mono text-xs font-bold text-blue-600">{order.order_number}</div>
                                        <div className="text-xs text-zinc-500 mt-1">
                                            {new Date(order.created_at).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-zinc-900 font-bold">
                                            {order.military_number} / {getRankLabel(order.rank)} / {order.user_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-medium">
                                            {order.order_type === 'online' ? '온라인' : '오프라인'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold font-mono">
                                        {formatCurrency(order.total_amount)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "font-bold",
                                                order.status === 'delivered' ? "bg-green-50 text-green-700" :
                                                    order.status === 'returned' ? "bg-red-50 text-red-700" : "bg-zinc-100 text-zinc-700"
                                            )}
                                        >
                                            {order.status === 'delivered' ? '판매완료' :
                                                order.status === 'returned' ? '반품완료' : order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 space-x-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                            disabled={order.status === 'returned' || loading === order.id}
                                            onClick={() => handleReturn(order.id, order.order_number)}
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            반품처리
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
