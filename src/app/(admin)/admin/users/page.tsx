import { getUsers } from "@/actions/users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import Link from "next/link";

export default async function UserListPage({
    searchParams,
}: {
    searchParams: { search?: string; role?: string };
}) {
    const result = await getUsers({
        search: searchParams.search,
        role: searchParams.role,
    });

    const users = result.success ? result.data : [];

    const roleLabels: Record<string, string> = {
        admin: "군수담당자",
        store: "판매소",
        tailor: "체척업체",
        user: "일반사용자",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">사용자 관리</h2>
                <Link href="/admin/users/new">
                    <Button className="bg-[#1d4ed8]">
                        <UserPlus className="mr-2 h-4 w-4" />
                        사용자 등록
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-[4px] border border-zinc-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="이름 또는 군번으로 검색..."
                        className="pl-10"
                        defaultValue={searchParams.search}
                    />
                </div>
                <Button variant="outline">검색</Button>
            </div>

            <div className="bg-white rounded-[4px] border border-zinc-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="w-[100px]">군번/사번</TableHead>
                            <TableHead>이름</TableHead>
                            <TableHead>역할</TableHead>
                            <TableHead>계급</TableHead>
                            <TableHead>소속</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead className="text-right">등록일</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                                    등록된 사용자가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-mono text-xs">{user.military_number}</TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal">
                                            {roleLabels[user.role] || user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.rank || "-"}</TableCell>
                                    <TableCell className="text-zinc-600">{user.unit || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? "success" : "secondary"}>
                                            {user.is_active ? "활성" : "비활성"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-500 text-xs">
                                        {new Date(user.created_at).toLocaleDateString()}
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
