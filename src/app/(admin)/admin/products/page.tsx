import { getProducts, getCategories } from "@/actions/products";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function ProductListPage({
    searchParams,
}: {
    searchParams: { search?: string; category?: string };
}) {
    const [productsResult, categoriesResult] = await Promise.all([
        getProducts({
            search: searchParams.search,
            categoryId: searchParams.category,
        }),
        getCategories(),
    ]);

    const products = productsResult.success ? productsResult.data : [];
    const categories = categoriesResult.success ? categoriesResult.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">품목 관리</h2>
                <Link href="/admin/products/new">
                    <Button className="bg-[#1d4ed8]">
                        <Plus className="mr-2 h-4 w-4" />
                        품목 등록
                    </Button>
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[4px] border border-zinc-200 shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="품목명으로 검색..."
                        className="pl-10"
                        defaultValue={searchParams.search}
                    />
                </div>
                <select
                    className="h-9 rounded-[4px] border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none"
                    defaultValue={searchParams.category || ""}
                >
                    <option value="">전체 카테고리</option>
                    {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    필터링
                </Button>
            </div>

            <div className="bg-white rounded-[4px] border border-zinc-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="w-[80px]">이미지</TableHead>
                            <TableHead>품목명</TableHead>
                            <TableHead>카테고리</TableHead>
                            <TableHead>유형</TableHead>
                            <TableHead className="text-right">단가</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead className="text-right">등록일</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                                    등록된 품목이 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: any) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="h-10 w-10 rounded-[2px] bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400">
                                            IMG
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.category_name || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {product.product_type === 'finished' ? '완제품' : '맞춤피복'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        {formatCurrency(product.base_price)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.is_active ? "success" : "secondary"}>
                                            {product.is_active ? "판매중" : "중단"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-400 text-xs">
                                        {new Date(product.created_at).toLocaleDateString()}
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
