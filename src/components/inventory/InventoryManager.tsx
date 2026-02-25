'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackagePlus, Search, AlertTriangle, History, ArrowRightLeft, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { adjustInventory } from "@/actions/inventory";

import { InventoryModal } from "./InventoryModal";

export function InventoryManager({
    initialInventory,
    categories
}: {
    initialInventory: any[];
    categories: any[]
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');

    // 모달 관련 상태
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'incoming' | 'adjust'>('incoming');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set('search', search); else params.delete('search');
        if (category) params.set('category', category); else params.delete('category');
        router.push(`${pathname}?${params.toString()}`);
    };

    const openModal = (item: any, type: 'incoming' | 'adjust') => {
        setSelectedItem(item);
        setModalType(type);
        setModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">재고 현황</h2>
                <Button className="bg-[#1d4ed8]" onClick={() => toast.info("신규 품목 입고는 품목 마스터 등록 후 가능합니다.")}>
                    <PackagePlus className="mr-2 h-4 w-4" />
                    신규 입고 등록
                </Button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="품목명으로 Like 검색 (대소문자 무관)"
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none w-[200px]"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">전체 카테고리</option>
                    {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <Button type="submit" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">필터 적용</Button>
            </form>

            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="pl-6 font-bold">품목명 / 카테고리</TableHead>
                            <TableHead className="font-bold">규격(사이즈)</TableHead>
                            <TableHead className="text-center font-bold">현재고</TableHead>
                            <TableHead className="font-bold">유형</TableHead>
                            <TableHead className="text-right pr-6 font-bold">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialInventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-zinc-500 italic">
                                    검색 결과와 일치하는 재고가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialInventory.map((item: any) => (
                                <TableRow key={item.id} className="hover:bg-zinc-50/50">
                                    <TableCell className="pl-6">
                                        <div className="font-bold text-zinc-900">{item.product_name}</div>
                                        <div className="text-xs text-zinc-500">{item.category_name || "-"}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 border-none font-medium">
                                            {item.spec_name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={cn(
                                            "inline-flex items-center font-mono font-bold text-lg px-3 py-1 rounded-full",
                                            item.quantity <= 10 ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50"
                                        )}>
                                            {item.quantity <= 10 && <AlertTriangle className="mr-1.5 h-4 w-4" />}
                                            {item.quantity}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "font-medium",
                                            item.product_type === 'finished' ? "text-zinc-600" : "text-indigo-600 border-indigo-200 bg-indigo-50"
                                        )}>
                                            {item.product_type === 'finished' ? '완제품' : '맞춤피복'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => toast.info(`최근 이력: ${item.product_name}`)}
                                        >
                                            <History className="h-4 w-4 text-zinc-400" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                                            onClick={() => openModal(item, 'incoming')}
                                        >
                                            <PlusCircle className="h-3.5 w-3.5" />
                                            입고
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1 border-zinc-300 text-zinc-600 hover:bg-zinc-50"
                                            onClick={() => openModal(item, 'adjust')}
                                        >
                                            <ArrowRightLeft className="h-3.5 w-3.5" />
                                            조정
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <InventoryModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                item={selectedItem}
                type={modalType}
            />
        </div>
    );
}
