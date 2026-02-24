import { getRecentOrders } from "@/actions/orders";
import { query } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function StoreSalesPage() {
    const storeId = "00000000-0000-0000-0000-000000000001"; // Mock

    // 1. 최근 주문 10건
    const ordersRes = await getRecentOrders(storeId, 10);
    const orders = (ordersRes.success && Array.isArray(ordersRes.data)) ? ordersRes.data : [];

    // 2. 판매 통계 (일간/월간)
    const statsRes = await query(`
        SELECT 
            COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_count,
            SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END) as today_sum,
            COUNT(CASE WHEN date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE) THEN 1 END) as month_count,
            SUM(CASE WHEN date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE) THEN total_amount ELSE 0 END) as month_sum
        FROM orders
        WHERE store_id = $1
    `, [storeId]);
    const s = statsRes.rows[0] || {};

    const stats = [
        { title: "오늘 판매 건수", value: `${s.today_count || 0}건`, icon: ShoppingBag, color: "text-blue-600" },
        { title: "오늘 매출 포인트", value: formatCurrency(Number(s.today_sum || 0)), icon: CreditCard, color: "text-green-600" },
        { title: "이번 달 판매 건수", value: `${s.month_count || 0}건`, icon: Calendar, color: "text-orange-600" },
        { title: "이번 달 매출 포인트", value: formatCurrency(Number(s.month_sum || 0)), icon: TrendingUp, color: "text-purple-600" },
    ];

    const rankLabels: Record<string, string> = {
        general: "장성", colonel: "대령", lt_colonel: "중령", major: "소령",
        captain: "대위", first_lt: "중위", second_lt: "소위", warrant: "준위",
        sgt_major: "원사", master_sgt: "상사", sgt: "중사", civil_servant: "군무원",
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">판매 현황 대시보드</h2>
                <p className="text-sm text-zinc-500">조회 시점의 실시간 판매 실적과 최근 주문 내역입니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">최근 주문 내역</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50">
                            <TableRow>
                                <TableHead className="pl-6">주문번호</TableHead>
                                <TableHead>주문자</TableHead>
                                <TableHead>계급/군번</TableHead>
                                <TableHead className="text-right">결제금액</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead className="text-right pr-6">일시</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-zinc-400">
                                        최근 주문 내역이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="pl-6 font-mono text-xs">{order.order_number}</TableCell>
                                        <TableCell className="font-bold">{order.user_name}</TableCell>
                                        <TableCell className="text-xs text-zinc-500">
                                            {rankLabels[order.rank] || order.rank} | {order.military_number}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(order.total_amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 text-xs text-zinc-400">
                                            {new Date(order.created_at).toLocaleString()}
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
