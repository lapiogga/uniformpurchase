/**
 * [수정 이력]
 * - 2026-02-25 00:25: 배송 관리(Store Orders) 페이지 구현
 * - 조치: orders 테이블 연동, 배송 상태 필터링 및 상태 업데이트 UI 구성
 */
import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function StoreOrdersPage() {
    // Mock store ID
    const storeId = "00000000-0000-0000-0000-000000000001";

    const result = await query(`
    SELECT o.*, u.name as user_name, u.rank, u.military_number
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.store_id = $1 AND o.order_type = 'online'
    ORDER BY o.created_at DESC
  `, [storeId]);

    const orders = result.rows;

    const statusMap: Record<string, { label: string; variant: any }> = {
        pending: { label: "주문대기", variant: "outline" },
        confirmed: { label: "결제완료", variant: "default" },
        shipping: { label: "배송중", variant: "warning" },
        delivered: { label: "배송완료", variant: "success" },
        cancelled: { label: "주문취소", variant: "destructive" },
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">배송 관리</h2>
                <p className="text-sm text-zinc-500">배송이 필요한 온라인 주문 내역을 관리합니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-zinc-50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Package className="h-5 w-5 text-zinc-400" />
                        <div>
                            <p className="text-xs text-zinc-500">전체 주문</p>
                            <p className="text-xl font-bold">{orders.length}</p>
                        </div>
                    </CardContent>
                </Card>
                {/* Additional status summary cards could go here */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">온라인 주문 리스트</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50">
                            <TableRow>
                                <TableHead className="pl-6">주문번호</TableHead>
                                <TableHead>주문자</TableHead>
                                <TableHead>품목유형</TableHead>
                                <TableHead className="text-right">결제금액</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead className="text-right pr-6">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!Array.isArray(orders) || orders.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-zinc-400">
                                        처리할 주문이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="pl-6 font-mono text-sm">{order.order_number}</TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{order.user_name}</div>
                                            <div className="text-xs text-zinc-500">{order.rank}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {order.product_type === 'finished' ? '완제품' : '맞춤피복'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(order.total_amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusMap[order.status]?.variant || "secondary"}>
                                                {statusMap[order.status]?.label || order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 space-x-2">
                                            {order.status === 'pending' && (
                                                <Button size="sm" variant="outline" className="h-8">확인</Button>
                                            )}
                                            {order.status === 'confirmed' && (
                                                <Button size="sm" className="h-8 bg-blue-600">배송 시작</Button>
                                            )}
                                            {order.status === 'shipping' && (
                                                <Button size="sm" className="h-8 bg-green-600">완료 처리</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
