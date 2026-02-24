import { grantAnnualPoints } from "@/actions/points";
import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function PointsPage() {
    const currentYear = new Date().getFullYear();

    let summary = {
        total_users: 0,
        total_granted: 0,
        total_used: 0,
        total_reserved: 0
    };
    let recentLogs: any[] = [];
    let error: string | null = null;

    try {
        // Get point status summary
        const summaryResult = await query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(total_granted) as total_granted,
                SUM(used_points) as total_used,
                SUM(reserved_points) as total_reserved
            FROM point_summary
        `);

        if (summaryResult?.rows?.[0]) {
            const row = summaryResult.rows[0];
            summary = {
                total_users: Number(row.total_users || 0),
                total_granted: Number(row.total_granted || 0),
                total_used: Number(row.total_used || 0),
                total_reserved: Number(row.total_reserved || 0)
            };
        }

        // Get recent ledger entries
        const ledgerResult = await query(`
            SELECT pl.*, u.name, u.rank, u.military_number
            FROM point_ledger pl
            JOIN users u ON pl.user_id = u.id
            ORDER BY pl.created_at DESC
            LIMIT 10
        `);
        recentLogs = Array.isArray(ledgerResult?.rows) ? ledgerResult.rows : [];
    } catch (e: any) {
        console.error('PointsPage data fetch error:', e);
        error = e.message || '데이터베이스 조회 중 오류가 발생했습니다.';
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-md">
                <h2 className="text-red-700 font-bold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    데이터를 불러올 수 없습니다
                </h2>
                <p className="text-red-600 text-sm">{error}</p>
                <p className="text-red-500 text-xs mt-2">
                    Tip: 데이터베이스에 `point_summary` 및 `point_ledger` 테이블이 있는지 확인해 주세요.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">포인트 관리</h2>
                <div className="flex gap-2">
                    <Button variant="outline">산정 미리보기</Button>
                    <Link href={"/tailor/tickets/register" as any}>
                        <Button variant={"outline" as any} className="gap-1.5 text-zinc-900 border-zinc-300">
                            <Search className="h-4 w-4" />
                            체척권 간편 등록
                        </Button>
                    </Link>
                    <form action={async () => {
                        'use server';
                        await grantAnnualPoints(new Date().getFullYear());
                    }}>
                        <Button className="bg-[#1d4ed8]">
                            <Coins className="mr-2 h-4 w-4" />
                            {currentYear}년 정기 포인트 지급
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">누적 지급 포인트</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(Number(summary.total_granted || 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">누적 사용 포인트</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">
                            {formatCurrency(Number(summary.total_used || 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">현재 예약(대기) 포인트</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(Number(summary.total_reserved || 0))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">최근 포인트 변동 이력</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-zinc-50">
                            <TableRow>
                                <TableHead>사용자</TableHead>
                                <TableHead>변동 유형</TableHead>
                                <TableHead className="text-right">금액</TableHead>
                                <TableHead>설명</TableHead>
                                <TableHead className="text-right">일시</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!Array.isArray(recentLogs) || recentLogs.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                        변동 이력이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentLogs.map((log: any) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="text-sm font-medium">{log.name}</div>
                                            <div className="text-xs text-zinc-500">{log.rank} | {log.military_number}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {log.point_type === 'grant' ? (
                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="h-3 w-3 text-blue-600" />
                                                )}
                                                <span className="text-sm">
                                                    {log.point_type === 'grant' ? '지급' : '차감'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold">
                                            {log.point_type === 'grant' ? '+' : '-'} {formatCurrency(log.amount)}
                                        </TableCell>
                                        <TableCell className="text-sm text-zinc-600">{log.description}</TableCell>
                                        <TableCell className="text-right text-xs text-zinc-400">
                                            {new Date(log.created_at).toLocaleString()}
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
