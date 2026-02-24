import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, FolderTree, Edit, Trash2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    let categories: any[] = [];
    try {
        const result = await query("SELECT * FROM categories ORDER BY level ASC, sort_order ASC");
        categories = result.rows;
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">카테고리 관리</h2>
                    <p className="text-sm text-zinc-500">품목 분류 체계를 관리합니다.</p>
                </div>
                <Button className="bg-[#1d4ed8]">
                    <Plus className="mr-2 h-4 w-4" />
                    카테고리 추가
                </Button>
            </div>

            <div className="bg-white rounded-[4px] border border-zinc-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="pl-6 text-zinc-500">분류명</TableHead>
                            <TableHead className="text-zinc-500">레벨</TableHead>
                            <TableHead className="text-zinc-500">정렬순서</TableHead>
                            <TableHead className="text-right pr-6 text-zinc-500">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-zinc-400">
                                    등록된 카테고리가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell className="pl-6 font-medium flex items-center gap-2">
                                        <FolderTree className={`h-4 w-4 ${cat.level === 1 ? 'text-blue-600' : 'text-zinc-400 ml-4'}`} />
                                        {cat.name}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.level === 1 ? 'bg-blue-50 text-blue-700' : 'bg-zinc-100 text-zinc-600'}`}>
                                            {cat.level}단계
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm">{cat.sort_order}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="h-8">수정</Button>
                                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700">삭제</Button>
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
