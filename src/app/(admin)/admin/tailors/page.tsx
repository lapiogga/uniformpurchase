import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Scissors, MapPin, Phone, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function AdminTailorsPage() {
    let tailors: any[] = [];
    try {
        const result = await query("SELECT * FROM tailors ORDER BY name ASC");
        tailors = result.rows;
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">체척업체 관리</h2>
                    <p className="text-sm text-zinc-500">맞춤피복 제작을 담당하는 협력 업체를 관리합니다.</p>
                </div>
                <Button className="bg-[#1d4ed8]">
                    <Plus className="mr-2 h-4 w-4" />
                    업체 등록
                </Button>
            </div>

            <div className="bg-white rounded-[4px] border border-zinc-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="pl-6 text-zinc-500">업체명</TableHead>
                            <TableHead className="text-zinc-500">위치</TableHead>
                            <TableHead className="text-zinc-500">연락처</TableHead>
                            <TableHead className="text-zinc-500">상태</TableHead>
                            <TableHead className="text-right pr-6 text-zinc-500">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tailors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-zinc-400">
                                    등록된 업체가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tailors.map((tailor) => (
                                <TableRow key={tailor.id}>
                                    <TableCell className="pl-6 font-bold flex items-center gap-2">
                                        <Scissors className="h-4 w-4 text-purple-600" />
                                        {tailor.name}
                                    </TableCell>
                                    <TableCell className="text-sm text-zinc-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-zinc-400" />
                                            {tailor.address || "정보 없음"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3 text-zinc-400" />
                                            {tailor.contact || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={tailor.is_active !== false ? "success" : "secondary" as any}>
                                            {tailor.is_active !== false ? "운영중" : "중지"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="h-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
