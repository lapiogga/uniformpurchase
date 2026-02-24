/**
 * [수정 이력]
 * - 2026-02-24 23:45: 사용자 포인트 정보 페이지 구현
 * - 조치: point_summary 및 point_ledger 테이블 연동, UI 고도화
 */
import { getPointSummary } from "@/actions/points";
import { query } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, History, ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function UserPointsPage() {
    // Mock current user ID
    const userId = "00000000-0000-0000-0000-000000000002";

    const summaryResult = await getPointSummary(userId);
    const ledgerResult = await query(`
    SELECT * FROM point_ledger 
    WHERE user_id = $1 
    ORDER BY created_at DESC 
    LIMIT 20
  `, [userId]);

    const summary = summaryResult.success ? summaryResult.data : null;
    const ledgerEntries = ledgerResult.rows;

    const currentStatus = summary ? {
        available: summary.total_granted - summary.used_points - summary.reserved_points,
        used: summary.used_points,
        reserved: summary.reserved_points,
        total: summary.total_granted
    } : { available: 0, used: 0, reserved: 0, total: 0 };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">포인트 정보</h2>
                <p className="text-sm text-zinc-500">지급된 피복 포인트의 상세 내역과 사용 현황입니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-600">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">가용 포인트</CardTitle>
                        <CreditCard className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(currentStatus.available)}</div>
                        <p className="text-xs text-zinc-400 mt-1">즉시 쇼핑 가능액</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">주문 대기 (예약)</CardTitle>
                        <Clock className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">{formatCurrency(currentStatus.reserved)}</div>
                        <p className="text-xs text-zinc-400 mt-1">결제 진행 중</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">누적 사용</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{formatCurrency(currentStatus.used)}</div>
                        <p className="text-xs text-zinc-400 mt-1">최종 구매 완료액</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">총 지급액</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-400">{formatCurrency(currentStatus.total)}</div>
                        <p className="text-xs text-zinc-400 mt-1">누적 기준</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="border-b bg-zinc-50/50">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-zinc-400" />
                        <CardTitle className="text-lg">포인트 변동 이력</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[180px]">변동 일시</TableHead>
                                <TableHead>구분</TableHead>
                                <TableHead className="text-right">변동 금액</TableHead>
                                <TableHead>설명</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ledgerEntries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                        변동 내역이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ledgerEntries.map((log: any) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs text-zinc-500 font-mono">
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {log.point_type === 'grant' ? (
                                                <Badge variant={"success" as any}>지급</Badge>
                                            ) : log.point_type === 'reserve' ? (
                                                <Badge variant={"warning" as any}>예약</Badge>
                                            ) : (
                                                <Badge variant={"destructive" as any}>사용</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${log.point_type === 'grant' ? 'text-green-600' : 'text-zinc-900'}`}>
                                            {log.point_type === 'grant' ? '+' : '-'} {formatCurrency(log.amount)}
                                        </TableCell>
                                        <TableCell className="text-sm text-zinc-600">
                                            {log.description}
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
