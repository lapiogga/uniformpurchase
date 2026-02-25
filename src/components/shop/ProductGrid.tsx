'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Check } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";
import { createOnlineOrder } from "@/actions/orders";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProductDetailModal } from "./ProductDetailModal";

export function ProductGrid({
    products,
    userId,
    availablePoints
}: {
    products: any[];
    userId: string;
    availablePoints: number;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const openDetail = (product: any) => {
        setSelectedProduct(product);
        setIsDetailOpen(true);
    };

    const handleOrder = async (product: any) => {
        if (product.base_price > availablePoints) {
            toast.error("가용 포인트가 부족합니다.");
            return;
        }

        if (!confirm(`[${product.name}] 상품을 주문하시겠습니까?\n포인트 ${formatCurrency(product.base_price)}가 예약됩니다.`)) {
            return;
        }

        setLoading(product.id);
        try {
            // Mock store ID (In real app, user might select a store or it's assigned)
            const storeId = "00000000-0000-0000-0000-000000000001";

            // For online orders, we might need to select a spec. 
            // Simplified: use a default spec if available or just the first one.
            // In a full implementation, this would open a modal to select size.
            const res = await createOnlineOrder({
                userId,
                storeId,
                productType: product.product_type,
                items: [{
                    productId: product.id,
                    specId: product.id, // Simplified for now, real app needs spec selection
                    quantity: 1,
                    unitPrice: product.base_price
                }]
            });

            if (res.success) {
                toast.success("주문이 완료되었습니다.");
                router.refresh();
            } else {
                toast.error(res.error || "주문 처리 중 오류가 발생했습니다.");
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {products.map((product, index) => (
                    <Card
                        key={product.id}
                        className="pearl-card group overflow-hidden flex flex-col border-none ring-1 ring-zinc-200/50 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => openDetail(product)}
                    >
                        <div className="aspect-[1/1] bg-white relative overflow-hidden flex items-center justify-center p-4">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-zinc-200 gap-3 group-hover:text-gold-premium/30 transition-colors duration-500">
                                    <Package className="h-12 w-12 opacity-10" />
                                    <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 text-center">시각화 대기 중</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            {product.product_type === 'custom' && (
                                <div className="absolute top-4 left-4 gold-gradient text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-gold-premium/20 ring-2 ring-white">
                                    맞춤제작
                                </div>
                            )}
                        </div>
                        <CardContent className="p-5 flex-1 flex flex-col justify-between bg-white relative">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-[1.5px] w-4 bg-gold-premium/30" />
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{product.category_name || '기성완제품'}</p>
                                </div>
                                <h3 className="font-black text-lg text-zinc-900 leading-tight tracking-tight group-hover:text-gold-premium transition-colors duration-300 line-clamp-2 min-h-[3rem]">{product.name}</h3>
                            </div>
                            <div className="flex flex-col gap-4 mt-6 pt-4 border-t border-zinc-50">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">포인트</span>
                                    <span className="text-xl font-black gold-text-gradient tracking-tighter">{formatCurrency(product.base_price)}</span>
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full gold-gradient text-white hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-premium/10 border-none h-10 rounded-xl font-black text-[10px] tracking-widest gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOrder(product);
                                    }}
                                    disabled={loading === product.id}
                                >
                                    {loading === product.id ? "..." : (
                                        <>
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                            주문하기
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-40 bg-white border-2 border-dashed border-zinc-100 rounded-[3rem]">
                        <Package className="h-20 w-20 mb-8 text-zinc-100 animate-pulse" />
                        <p className="text-zinc-300 font-black tracking-widest uppercase text-xs">준비된 상품이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 상세 보기 모달 */}
            <ProductDetailModal
                product={selectedProduct}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                onOrder={handleOrder}
            />
        </div>
    );
}
