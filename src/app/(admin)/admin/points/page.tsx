import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Coins, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { PointActionButtons } from "@/components/admin/points/PointActionButtons";

export const dynamic = 'force-dynamic';

export default async function PointsPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const params = await searchParams;
    const currentYear = new Date().getFullYear();

    // 1. 계급 한글 매핑 도구
    const rankLabels: Record<string, string> = {
        general: "장성",
        colonel: "대령",
        lt_colonel: "중령",
        major: "소령",
        captain: "대위",
        first_lt: "중위",
        second_lt: "소위",
        warrant: "준위",
        sgt_major: "원사",
        master_sgt: "상사",
        sgt: "중사",
        civil_servant: "군무원",
    };

    // 2. 사용자별 포인트 통합 정보 조회 (검색 지원)
    let userPoints: any[] = [];
    let error: string | null = null;

    try {
        let sql = `
            SELECT 
                u.id, u.name, u.rank, u.military_number, u.unit,
                COALESCE(ps.total_granted, 0) as total_granted,
                COALESCE(ps.used_points, 0) as used_points,
                COALESCE(ps.reserved_points, 0) as reserved_points
            FROM users u
            LEFT JOIN point_summary ps ON u.id = ps.user_id
            WHERE u.role = 'user'
        `;
        const queryParams: any[] = [];
        if (params.search) {
            queryParams.push(`%${params.search}%`);
            sql += ` AND (u.name ILIKE $1 OR u.unit ILIKE $1)`;
        }
        sql += ` ORDER BY u.name ASC`;

        const result = await query(sql, queryParams);
        userPoints = result.rows;
    } catch (e: any) {
        error = e.message;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">포인트 지급 대상 목록</h2>
                    <p className="text-sm text-zinc-500">각 사용자의 포인트 지급 및 사용 현황을 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <PointActionButtons currentYear={currentYear} />
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center gap-4">
                        <form className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <Input
                                name="search"
                                placeholder="성명 또는 소속으로 검색..."
                                className="pl-10"
                                defaultValue={params.search}
                            />
                        </form>
                        <Button type="submit" variant="secondary">검색</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50/50">
                            <TableRow>
                                <TableHead className="pl-6">군번</TableHead>
                                <TableHead>성명</TableHead>
                                <TableHead>계급</TableHead>
                                <TableHead>소속</TableHead>
                                <TableHead className="text-right">지급</TableHead>
                                <TableHead className="text-right">사용</TableHead>
                                <TableHead className="text-right">예약</TableHead>
                                <TableHead className="text-right pr-6 text-blue-700">사용가능</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userPoints.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-zinc-400">
                                        검색 결과가 없거나 데이터가 존재하지 않습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                userPoints.map((user: any) => {
                                    const available = user.total_granted - user.used_points - user.reserved_points;
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell className="pl-6 font-mono text-xs">{user.military_number}</TableCell>
                                            <TableCell className="font-bold">{user.name}</TableCell>
                                            <TableCell>{rankLabels[user.rank] || user.rank}</TableCell>
                                            <TableCell className="text-zinc-600 text-sm">{user.unit}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(user.total_granted)}</TableCell>
                                            <TableCell className="text-right text-red-600">{formatCurrency(user.used_points)}</TableCell>
                                            <TableCell className="text-right text-orange-600">{formatCurrency(user.reserved_points)}</TableCell>
                                            <TableCell className="text-right pr-6 font-bold text-blue-700">
                                                {formatCurrency(available)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                    오류: {error}
                </div>
            )}
        </div>
    );
}
