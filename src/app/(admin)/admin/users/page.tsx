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

import { formatCurrency, cn, getRankLabel } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string; role?: string }>;
}) {
    const params = await searchParams;
    const activeRole = params.role || 'user';

    const roleLabels: Record<string, string> = {
        admin: "군수담당자",
        store: "피복판매소",
        tailor: "체척업체",
        user: "일반사용자",
    };

    // 2. 사용자 목록 조회
    let users: any[] = [];
    try {
        let sql = `SELECT * FROM users WHERE role = $1`;
        const queryParams: any[] = [activeRole];

        if (params.search) {
            queryParams.push(`%${params.search}%`);
            sql += ` AND (name ILIKE $2 OR military_number ILIKE $2 OR email ILIKE $2)`;
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

            <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <nav className="flex border-b mb-2">
                    {Object.entries(roleLabels).map(([role, label]) => (
                        <Link
                            key={role}
                            href={`?role=${role}${params.search ? `&search=${params.search}` : ''}`}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                activeRole === role
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <form className="relative flex-1 max-w-md flex gap-2">
                    <input type="hidden" name="role" value={activeRole} />
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            name="search"
                            placeholder="성명, 군번, 이메일 검색..."
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
                                    <TableCell className="pl-6 font-mono text-xs text-zinc-500">{user.military_number || "-"}</TableCell>
                                    <TableCell className="text-sm font-medium">{getRankLabel(user.rank) || "-"}</TableCell>
                                    <TableCell className="font-bold flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-blue-500" />
                                            {user.name}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 font-normal ml-6">{user.email}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-zinc-600">{user.unit || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? "success" : "secondary" as any} className={user.is_active ? "bg-green-50 text-green-700 border-green-200" : ""}>
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
