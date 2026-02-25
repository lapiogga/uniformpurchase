'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Heart, Share2, ShieldCheck, Ruler } from "lucide-react";
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
            <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white border-none rounded-[2rem] shadow-2xl">
                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                    {/* Left: Image Section */}
                    <div className="w-full md:w-[55%] bg-[#F8FAFC] relative flex items-center justify-center p-12">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                width={800}
                                height={800}
                                className="object-contain w-full h-full animate-in zoom-in-95 duration-700"
                            />
                        ) : (
                            <div className="text-zinc-200">No Image Available</div>
                        )}
                        <div className="absolute top-8 left-8 flex flex-col gap-3">
                            {product.product_type === 'custom' && (
                                <Badge className="gold-gradient text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    맞춤 제작
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Right: Content Section */}
                    <div className="w-full md:w-[45%] p-12 flex flex-col justify-between overflow-y-auto">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">{product.category_name}</span>
                                <div className="flex gap-6">
                                    <button className="text-zinc-300 hover:text-zinc-900 transition-colors"><Heart className="h-6 w-6" /></button>
                                    <button className="text-zinc-300 hover:text-zinc-900 transition-colors"><Share2 className="h-6 w-6" /></button>
                                </div>
                            </div>
                            <h2 className="text-5xl font-black tracking-tight text-zinc-900 leading-tight font-premium">
                                {product.name}
                            </h2>
                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-black gold-text-gradient tracking-tighter">
                                    {formatCurrency(product.base_price)}
                                </span>
                                <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">포인트 가치</span>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-zinc-100" />

                        <div className="space-y-6">
                            <h4 className="text-[13px] font-black text-zinc-900 uppercase tracking-widest">상품 상세 설명</h4>
                            <p className="text-lg text-zinc-500 leading-relaxed font-medium">
                                {product.description || '최고급 원단과 혁신적인 공법으로 제작된 컬렉션입니다. 시간이 흘러도 변치 않는 가치를 선사합니다.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-zinc-50 rounded-2xl">
                                    <ShieldCheck className="h-6 w-6 text-zinc-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[12px] font-black uppercase text-zinc-900">철저한 품질 검증</p>
                                    <p className="text-[11px] text-zinc-400 font-bold tracking-tight">군 표준 규격 승인 완료</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-zinc-50 rounded-2xl">
                                    <Ruler className="h-6 w-6 text-zinc-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[12px] font-black uppercase text-zinc-900">맞춤형 핏 제공</p>
                                    <p className="text-[11px] text-zinc-400 font-bold tracking-tight">정교한 장인의 마감</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-16 flex flex-col gap-6">
                            <Button
                                className="w-full h-20 gold-gradient text-white rounded-3xl font-black text-lg tracking-widest shadow-2xl shadow-gold-premium/40 border-none transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-4"
                                onClick={() => onOrder(product)}
                            >
                                <ShoppingCart className="h-6 w-6" />
                                지금 바로 주문하기
                            </Button>
                            <p className="text-center text-[12px] font-black text-zinc-400 uppercase tracking-widest">
                                포인트 지갑을 통한 안전한 보안 거래
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
