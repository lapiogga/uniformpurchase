/**
 * [수정 이력]
 * - 2026-02-25 00:00: 판매소 대시보드(Store Dashboard) 페이지 구현
 * - 조치: inventory 테이블 연동, 실시간 재고 현황 및 통계 요약 표시
 */
import { getInventory } from "@/actions/inventory";
import { query } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, RefreshCw, TrendingUp, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function StoreDashboardPage() {
    // Mock store ID
    const storeId = "00000000-0000-0000-0000-000000000001";

    // 데이터 fetch
    const inventoryResult = await getInventory(storeId);
    const inventory = inventoryResult.success ? inventoryResult.data : [];

    // 통계 계산
    const lowStockItems = Array.isArray(inventory) ? inventory.filter((item: any) => item.quantity <= 10).length : 0;

    // 최근 주문 건수 (Mock or DB Query)
    const todaySalesResult = await query(`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
    FROM orders 
    WHERE store_id = $1 AND DATE(created_at) = CURRENT_DATE
  `, [storeId]);
    const todaySales = todaySalesResult.rows[0] || { count: 0, total: 0 };

    const stats = [
        { title: "오늘 판매", value: `${todaySales.count}건`, sub: formatCurrency(Number(todaySales.total)), icon: ShoppingBag, color: "text-blue-600" },
        { title: "재고 품목", value: `${Array.isArray(inventory) ? inventory.length : 0}종`, sub: "전체 규격 포함", icon: Package, color: "text-zinc-600" },
        { title: "재고 부족", value: `${lowStockItems}건`, sub: "10개 미만 품목", icon: RefreshCw, color: "text-red-500" },
        { title: "배송 대기", value: "0건", sub: "온라인 주문", icon: TrendingUp, color: "text-purple-600" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">판매소 대시보드</h2>
                    <p className="text-sm text-zinc-500">실시간 재고 현황 및 오늘의 판매 요약을 확인하세요.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/store/sales/new">
                        <Button className="bg-[#1D4ED8] gap-1.5">
                            <Plus className="h-4 w-4" />
                            오프라인 판매 등록
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-zinc-400 mt-1">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">현재고 현황 (Top 20)</CardTitle>
                    <Link href="/store/inventory">
                        <Button size={"sm" as any} variant={"ghost" as any} className="text-xs text-zinc-500 hover:text-primary">
                            전체 보기
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50">
                            <TableRow>
                                <TableHead className="pl-6">품목명</TableHead>
                                <TableHead>규격</TableHead>
                                <TableHead>카테고리</TableHead>
                                <TableHead className="text-right">단가</TableHead>
                                <TableHead className="text-right pr-6">현재고</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(inventory) && inventory.slice(0, 20).map((item: any) => (
                                <TableRow key={item.id} className="group hover:bg-zinc-50/50">
                                    <TableCell className="pl-6 py-4 font-medium text-zinc-900">{item.product_name}</TableCell>
                                    <TableCell className="text-sm text-zinc-600">{item.spec_name}</TableCell>
                                    <TableCell className="text-xs text-zinc-500">{item.category_name}</TableCell>
                                    <TableCell className="text-right font-mono text-sm">{formatCurrency(item.price || 0)}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge
                                            className={(item.quantity <= 10 ? "bg-red-100 text-red-700 border-none" : "bg-zinc-100 text-zinc-900 border-none") as any}
                                        >
                                            {item.quantity} 개
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!Array.isArray(inventory) || inventory.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-zinc-400">
                                        <Package className="h-10 w-10 mx-auto mb-2 opacity-10" />
                                        재고 데이터가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
