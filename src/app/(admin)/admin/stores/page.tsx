/**
 * [수정 이력]
 * - 2026-02-25 00:30: 판매소 관리(Admin Stores) 페이지 구현
 * - 조치: stores 테이블 연동, 활성 상태 모델 반영 및 목록 UI 구성
 */
import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Store, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminStoresPage() {
    let stores: any[] = [];
    let error: string | null = null;

    try {
        const result = await query("SELECT * FROM stores ORDER BY name ASC");
        stores = Array.isArray(result?.rows) ? result.rows : [];
    } catch (e: any) {
        console.error('AdminStoresPage error:', e);
        error = e.message || '데이터베이스 조회 중 오류가 발생했습니다.';
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-md">
                <h2 className="text-red-700 font-bold mb-2 flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    판매소 정보를 불러올 수 없습니다
                </h2>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">판매소 관리</h2>
                <Link href="/admin/stores/new">
                    <Button className="bg-[#1d4ed8]">
                        <Plus className="mr-2 h-4 w-4" />
                        판매소 등록
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6">
                {stores.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-lg border border-dashed text-zinc-500">
                        등록된 판매소가 없습니다.
                    </div>
                ) : (
                    <div className="bg-white rounded-[4px] border border-zinc-200 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50">
                                <TableRow>
                                    <TableHead className="pl-6 font-bold">판매소명</TableHead>
                                    <TableHead className="font-bold">위치</TableHead>
                                    <TableHead className="font-bold">연락처</TableHead>
                                    <TableHead className="font-bold">담당자</TableHead>
                                    <TableHead className="font-bold">상태</TableHead>
                                    <TableHead className="text-right pr-6 font-bold">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stores.map((store) => (
                                    <TableRow key={store.id} className="hover:bg-zinc-50/50">
                                        <TableCell className="pl-6 font-bold flex items-center gap-2">
                                            <Store className="h-4 w-4 text-blue-600" />
                                            {store.name}
                                        </TableCell>
                                        <TableCell className="text-sm text-zinc-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-zinc-400" />
                                                {store.address || "정보 없음"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3 text-zinc-400" />
                                                {store.contact || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">{store.manager_name || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={(store.is_active ? "success" : "secondary") as any}>
                                                {store.is_active ? "운영중" : "중지"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" className="text-blue-600">수정</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
