/**
 * [수정 이력]
 * - 2026-02-24 18:10: Next.js 15 업그레이드에 따른 searchParams 비동기 처리 대응
 * - 조치: searchParams 타입을 Promise로 변경하고 await 구문 추가
 */
import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Settings, Edit } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const params = await searchParams;

    // 1. 계급 한글 매핑
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

    // 2. 사용자 목록 조회 (ILIKE 검색)
    let users: any[] = [];
    try {
        let sql = `SELECT * FROM users WHERE role = 'user'`;
        const queryParams: any[] = [];
        if (params.search) {
            queryParams.push(`%${params.search}%`);
            sql += ` AND name ILIKE $1`;
        }
        sql += ` ORDER BY name ASC`;
        const result = await query(sql, queryParams);
        users = result.rows;
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">사용자 관리</h2>
                <Link href="/admin/users/new">
                    <Button className="bg-[#1d4ed8]">
                        <Plus className="mr-2 h-4 w-4" />
                        사용자 등록
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <form className="relative flex-1 max-w-md flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            name="search"
                            placeholder="성명으로 Like 검색..."
                            className="pl-10"
                            defaultValue={params.search}
                        />
                    </div>
                    <Button type="submit" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">검색</Button>
                </form>
            </div>

            <div className="bg-white rounded-[4px] border border-zinc-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="pl-6 text-zinc-500 font-bold">군번</TableHead>
                            <TableHead className="text-zinc-500 font-bold">계급</TableHead>
                            <TableHead className="text-zinc-500 font-bold">이름</TableHead>
                            <TableHead className="text-zinc-500 font-bold">소속</TableHead>
                            <TableHead className="text-zinc-500 font-bold">상태</TableHead>
                            <TableHead className="text-right pr-6 text-zinc-500 font-bold">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-zinc-500 italic">
                                    등록된 사용자가 없거나 검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-zinc-50/50">
                                    <TableCell className="pl-6 font-mono text-xs text-zinc-500">{user.military_number}</TableCell>
                                    <TableCell className="text-sm font-medium">{rankLabels[user.rank] || user.rank}</TableCell>
                                    <TableCell className="font-bold flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="text-sm text-zinc-600">{user.unit}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? "success" : "secondary" as any}>
                                            {user.is_active ? "활성" : "비활성"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/users/${user.id}/edit`}>
                                                <Button variant="outline" size="sm" className="h-8 gap-1 text-zinc-600 border-zinc-300">
                                                    <Settings className="h-3.5 w-3.5" />
                                                    조정
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/users/${user.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="h-8 gap-1 text-blue-600 hover:bg-blue-50">
                                                    <Edit className="h-3.5 w-3.5" />
                                                    수정
                                                </Button>
                                            </Link>
                                        </div>
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
