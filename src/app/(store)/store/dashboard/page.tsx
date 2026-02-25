import { getInventory } from "@/actions/inventory";
import { getRecentOrders } from "@/actions/orders";
import { query } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, RefreshCw, TrendingUp, Plus, Calendar, CreditCard, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StoreDashboardPage() {
    // 세션 정보 가져오기
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/');
    }

    const session = JSON.parse(sessionCookie.value);
    const storeId = session.store_id;

    if (!storeId) {
        return <div className="p-8 text-center text-red-500 font-bold">판매소 권한이 없는 계정입니다.</div>;
    }

    // 1. 데이터 fetch (재고, 최근 주문, 판매 통계)
    const [inventoryResult, ordersRes, statsRes] = await Promise.all([
        getInventory(storeId),
        getRecentOrders(storeId, 5),
        query(`
            SELECT 
                COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_count,
                SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END) as today_sum,
                COUNT(CASE WHEN date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE) THEN 1 END) as month_count,
                SUM(CASE WHEN date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE) THEN total_amount ELSE 0 END) as month_sum
            FROM orders
            WHERE store_id = $1
        `, [storeId])
    ]);

    const inventory = Array.isArray(inventoryResult?.data) ? inventoryResult.data : [];
    const orders = (ordersRes.success && Array.isArray(ordersRes.data)) ? ordersRes.data : [];
    const s = statsRes.rows[0] || {};

    const lowStockItems = inventory.filter((item: any) => item.quantity <= 10).length;

    const stats = [
        { title: "오늘 판매", value: `${s.today_count || 0}건`, sub: formatCurrency(Number(s.today_sum || 0)), icon: ShoppingBag, color: "text-blue-600" },
        { title: "이번 달 누적", value: `${s.month_count || 0}건`, sub: formatCurrency(Number(s.month_sum || 0)), icon: Calendar, color: "text-green-600" },
        { title: "재고 부족", value: `${lowStockItems}건`, sub: "안전재고 미달", icon: RefreshCw, color: "text-red-500" },
        { title: "전체 품목", value: `${inventory.length}종`, sub: "규격 포함", icon: Package, color: "text-purple-600" },
    ];

    const rankLabels: Record<string, string> = {
        general: "장성", colonel: "대령", lt_colonel: "중령", major: "소령",
        captain: "대위", first_lt: "중위", second_lt: "소위", warrant: "준위",
        sgt_major: "원사", master_sgt: "상사", sgt: "중사", civil_servant: "군무원",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">판매소 통합 대시보드</h2>
                    <p className="text-sm text-zinc-500">실시간 판매 실적과 재고 현황을 한눈에 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/store/sales/new">
                        <Button className="bg-[#1D4ED8] gap-1.5 shadow-sm">
                            <Plus className="h-4 w-4" />
                            오프라인 판매 등록
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-zinc-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-zinc-400 mt-1 font-medium">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 최근 주문 내역 */}
                <Card className="border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">최근 주문 내역</CardTitle>
                        <Link href="/store/sales">
                            <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-blue-600">전체보기</Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50/50">
                                <TableRow>
                                    <TableHead className="pl-6">주문자</TableHead>
                                    <TableHead className="text-right">금액</TableHead>
                                    <TableHead className="text-right pr-6">일시</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-40 text-center text-zinc-400">내역 없음</TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order: any) => (
                                        <TableRow key={order.id} className="hover:bg-zinc-50/50">
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-zinc-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{order.user_name}</div>
                                                        <div className="text-xs text-zinc-500">{rankLabels[order.rank]}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-sm">{formatCurrency(order.total_amount)}</TableCell>
                                            <TableCell className="text-right pr-6 text-xs text-zinc-400">
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 재고 부족 알림 */}
                <Card className="border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">재고 부족 품목</CardTitle>
                        <Link href="/store/inventory">
                            <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-blue-600">재고관리</Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50/50">
                                <TableRow>
                                    <TableHead className="pl-6">품목명 (규격)</TableHead>
                                    <TableHead className="text-right pr-6">현재고</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory.filter((i: any) => i.quantity <= 10).slice(0, 5).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-40 text-center text-zinc-400">부족 품목 없음</TableCell>
                                    </TableRow>
                                ) : (
                                    inventory.filter((i: any) => i.quantity <= 10).slice(0, 5).map((item: any) => (
                                        <TableRow key={item.id} className="hover:bg-zinc-50/50">
                                            <TableCell className="pl-6 text-sm">
                                                {item.product_name} <span className="text-zinc-400 text-xs ml-1">({item.spec_name})</span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Badge variant="outline" className="text-red-600 bg-red-50 border-red-100 font-bold">
                                                    {item.quantity}개
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
