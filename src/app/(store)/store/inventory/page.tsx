/**
 * [수정 이력]
 * - 2026-02-24 18:10: Next.js 15 업그레이드에 따른 searchParams 비동기 처리 대응
 * - 조치: searchParams 타입을 Promise로 변경하고 await 구문 추가
 */
import { getInventory } from "@/actions/inventory";
import { getCategories } from "@/actions/products";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackagePlus, Search, AlertTriangle, History } from "lucide-react";

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string }>;
}) {
    const params = await searchParams;
    // Mock store ID for now
    const storeId = "00000000-0000-0000-0000-000000000001";

    const [inventoryResult, categoriesResult] = await Promise.all([
        getInventory(storeId, {
            search: params.search,
            categoryId: params.category,
        }),
        getCategories(),
    ]);

    const inventory = inventoryResult.success ? inventoryResult.data : [];
    const categories = categoriesResult.success ? categoriesResult.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">재고 현황</h2>
                <Button className="bg-[#1d4ed8]">
                    <PackagePlus className="mr-2 h-4 w-4" />
                    입고 처리
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[4px] border border-zinc-200 shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="품목명으로 재고 검색..."
                        className="pl-10"
                        defaultValue={params.search}
                    />
                </div>
                <select
                    className="h-9 rounded-[4px] border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none"
                    defaultValue={params.category || ""}
                >
                    <option value="">전체 카테고리</option>
                    {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-[4px] border border-zinc-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead>품목명</TableHead>
                            <TableHead>카테고리</TableHead>
                            <TableHead>규격(사이즈)</TableHead>
                            <TableHead className="text-center">현재고</TableHead>
                            <TableHead>유형</TableHead>
                            <TableHead className="text-right">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                    재고 데이터가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            inventory.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.product_name}</TableCell>
                                    <TableCell>{item.category_name || "-"}</TableCell>
                                    <TableCell>{item.spec_name}</TableCell>
                                    <TableCell className="text-center">
                                        <span className={cn(
                                            "inline-flex items-center font-bold px-2 py-1 rounded",
                                            item.quantity <= 5 ? "text-red-600 bg-red-50" : "text-zinc-900"
                                        )}>
                                            {item.quantity <= 5 && <AlertTriangle className="mr-1 h-3 w-3" />}
                                            {item.quantity}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {item.product_type === 'finished' ? '완제품' : '맞춤'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm">
                                            <History className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm">조정</Button>
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

// Ensure cn is imported
import { cn } from "@/lib/utils";
