import { query } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ShoppingBag, AlertTriangle, FileText, History } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    // 1. 포인트 요약 데이터 호출
    const pointSummaryRes = await query(`
        SELECT SUM(total_granted) as granted, SUM(used_points) as used, SUM(reserved_points) as reserved 
        FROM point_summary
    `);
    const pSum = pointSummaryRes.rows[0] || {};

    // 2. 통합 대시보드 지표 (일부 Mock 데이터 포함)
    const stats = [
        { title: "누적 지급 포인트", value: formatCurrency(Number(pSum.granted || 0)), icon: CreditCard, color: "text-blue-600", desc: "전체 사용자 대상" },
        { title: "누적 사용 포인트", value: formatCurrency(Number(pSum.used || 0)), icon: ShoppingBag, color: "text-green-600", desc: "구매 확정 기준" },
        { title: "현재 예약 포인트", value: formatCurrency(Number(pSum.reserved || 0)), icon: History, color: "text-orange-600", desc: "결제 진행 중" },
        { title: "부족재고 품목", value: "8건", icon: AlertTriangle, color: "text-red-500", desc: "안전재고 미달" },
        { title: "체척 정산요청", value: "3건", icon: FileText, color: "text-indigo-600", desc: "정산 대기 중" },
        { title: "체척 취소요청", value: "1건", icon: AlertTriangle, color: "text-rose-500", desc: "승인 대기" },
    ];

    // 3. 최근 포인트 변동 이력
    const ledgerRes = await query(`
        SELECT pl.*, u.name, u.rank, u.military_number
        FROM point_ledger pl
        JOIN users u ON pl.user_id = u.id
        ORDER BY pl.created_at DESC
        LIMIT 5
    `);
    const recentLogs = ledgerRes.rows;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">관리자 대시보드</h2>
                <div className="text-sm text-zinc-500">{new Date().toLocaleDateString('ko-KR')} 기준 실시간 현황</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-zinc-500 mt-1">{stat.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="text-lg">최근 포인트 변동 이력</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50/50">
                                <TableRow>
                                    <TableHead className="pl-6">사용자</TableHead>
                                    <TableHead>구분</TableHead>
                                    <TableHead className="text-right">금액</TableHead>
                                    <TableHead className="text-right pr-6">일시</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentLogs.map((log: any) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="pl-6 py-3">
                                            <div className="text-sm font-medium">{log.name}</div>
                                            <div className="text-xs text-zinc-500 font-mono">{log.military_number}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${log.point_type === 'grant' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {log.point_type === 'grant' ? '지급' : '사용'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {log.point_type === 'grant' ? '+' : '-'} {formatCurrency(log.amount)}
                                        </TableCell>
                                        <TableCell className="text-right pr-6 text-xs text-zinc-400">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg">판매소별 요약 현황</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* 판매소별 데이터 Mockup */}
                            {[
                                { name: "계룡대 판매소", items: 154, stockAlert: 2 },
                                { name: "용산 판매소", items: 89, stockAlert: 5 },
                                { name: "자운대 판매소", items: 120, stockAlert: 1 },
                            ].map((store, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <div className="text-sm font-bold">{store.name}</div>
                                        <div className="text-xs text-zinc-500">취급 품목: {store.items}개</div>
                                    </div>
                                    <div className="text-right">
                                        {store.stockAlert > 0 && (
                                            <div className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                                부족재고 {store.stockAlert}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
