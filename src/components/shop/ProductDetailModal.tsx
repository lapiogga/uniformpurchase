'use client';

import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Heart, Share2, ShieldCheck, Ruler, X, Info } from "lucide-react";
import Image from "next/image";

export function ProductDetailModal({
    product,
    open,
    onOpenChange,
    onOrder
}: {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOrder: (product: any) => void;
}) {
    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1100px] p-0 overflow-hidden bg-white border-none rounded-none shadow-2xl h-[90vh] md:h-auto overflow-y-auto ring-8 ring-[#444]/5">
                <DialogTitle className="sr-only">{product.name} 상세 정보</DialogTitle>

                <div className="flex flex-col md:flex-row">
                    {/* Left: Image Section */}
                    <div className="w-full md:w-1/2 bg-[#f0f0f0] relative flex items-center justify-center p-12">
                        <div className="relative w-full aspect-[3/4] shadow-2xl ring-1 ring-black/5">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 bg-white">
                                    <h2 className="text-4xl font-black opacity-10 uppercase tracking-widest">No Image</h2>
                                </div>
                            )}
                        </div>

                        {/* Featured Tag */}
                        <div className="absolute top-8 left-8">
                            <span className="bg-[#ed786a] text-white px-6 py-2 text-xs font-black uppercase tracking-widest italic">추천 보급품</span>
                        </div>
                    </div>

                    {/* Right: Info Section */}
                    <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col bg-white">
                        <div className="flex-1 space-y-12">
                            {/* Header */}
                            <header className="border-b-4 border-[#f0f0f0] pb-8">
                                <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em] mb-4">대한민국 해군 공식 보급 아카이브</p>
                                <h2 className="text-4xl font-black text-[#444] uppercase tracking-tight leading-none">
                                    {product.name}
                                </h2>
                                <p className="text-sm font-bold text-zinc-300 mt-2 uppercase tracking-widest">{product.category_name || '국방 표준 보급'}</p>
                            </header>

                            {/* Summary Box */}
                            <div className="bg-[#f0f0f0] p-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">필요 포인트</span>
                                    <span className="text-3xl font-black text-[#ed786a] tracking-tight">{formatCurrency(product.base_price)}</span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">재고 상태</span>
                                    <span className="text-[10px] font-black text-[#444] uppercase bg-white px-4 py-1.5">보급 가능</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-[#444] uppercase tracking-widest flex items-center gap-3">
                                    <Info className="h-5 w-5 text-[#ed786a]" />
                                    제품 상세 설명
                                </h3>
                                <p className="text-md text-zinc-500 font-medium leading-relaxed italic">
                                    {product.description || '최상의 함상 작전 수행과 일상 업무의 편의성을 동시에 충족시키기 위해 설계된 하이 퍼포먼스 컬렉션입니다.'}
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-16 space-y-6">
                            <button
                                className="w-full h-20 bg-[#ed786a] text-white font-black text-lg tracking-widest shadow-xl transition-all hover:brightness-110 active:scale-[0.98] uppercase italic flex items-center justify-center gap-4"
                                onClick={() => onOrder(product)}
                            >
                                <ShoppingCart className="h-6 w-6" />
                                지금 보급 신청
                            </button>
                            <p className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] leading-relaxed">
                                해군 보급창 통합 자산 관리 시스템에 의해 인증됨
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
