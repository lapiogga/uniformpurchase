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
import { Plus, Search, Package, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const params = await searchParams;

    // 1. 품목 목록 조회 (ILIKE 검색)
    let products: any[] = [];
    try {
        let sql = `
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
        `;
        const queryParams: any[] = [];
        if (params.search) {
            queryParams.push(`%${params.search}%`);
            sql += ` WHERE p.name ILIKE $1`;
        }
        sql += ` ORDER BY p.name ASC`;
        const result = await query(sql, queryParams);
        products = result.rows;
    } catch (e) {
        console.error(e);
    }

    const typeLabels: Record<string, string> = {
        finished: "완제품",
        custom: "맞춤피복"
    };

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

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
                <form className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        name="search"
                        placeholder="품목명으로 검색..."
                        className="pl-10"
                        defaultValue={params.search}
                    />
                </form>
                <Button variant="secondary">검색</Button>
            </div>

            <div className="bg-white rounded-[4px] border border-zinc-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="pl-6 text-zinc-500">품목명</TableHead>
                            <TableHead className="text-zinc-500">카테고리</TableHead>
                            <TableHead className="text-zinc-500">유형</TableHead>
                            <TableHead className="text-right text-zinc-500">기준가격</TableHead>
                            <TableHead className="text-zinc-500">상태</TableHead>
                            <TableHead className="text-right pr-6 text-zinc-500">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-zinc-400">
                                    등록된 품목이 없거나 검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="pl-6 font-bold flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-100 rounded overflow-hidden flex items-center justify-center">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="h-5 w-5 text-zinc-400" />
                                            )}
                                        </div>
                                        {product.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{product.category_name || "미지정"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-medium ${product.product_type === 'custom' ? 'text-purple-600' : 'text-blue-600'}`}>
                                            {typeLabels[product.product_type] || product.product_type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(product.base_price)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.is_active ? "success" : "secondary" as any}>
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
