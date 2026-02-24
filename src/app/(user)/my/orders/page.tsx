import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MyOrdersPage() {
    // Mock current user ID
    const userId = "00000000-0000-0000-0000-000000000002";

    const result = await query(`
    SELECT o.*, s.name as store_name
    FROM orders o
    LEFT JOIN stores s ON o.store_id = s.id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
  `, [userId]);

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
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">주문 내역</h2>
            </div>

            <div className="grid gap-6">
                {orders.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-zinc-500 border-dashed">
                        <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                        <p>아직 주문 내역이 없습니다.</p>
                    </Card>
                ) : (
                    orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="bg-zinc-50 border-b px-6 py-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider">주문일자</p>
                                            <p className="text-sm font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider">주문번호</p>
                                            <p className="text-sm font-mono font-semibold">{order.order_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={statusMap[order.status]?.variant || "secondary"}>
                                            {statusMap[order.status]?.label || order.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">
                                            {order.product_type === 'finished' ? '완제품' : '맞춤피복'} 구매
                                        </h3>
                                        <p className="text-sm text-zinc-600">
                                            매장: {order.store_name || "온라인 통합"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500">결제 금액</p>
                                        <p className="text-xl font-bold text-primary">{formatCurrency(order.total_amount)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
