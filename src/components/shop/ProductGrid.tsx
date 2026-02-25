'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, ExternalLink } from "lucide-react";
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
            const storeId = "00000000-0000-0000-0000-000000000001";
            const res = await createOnlineOrder({
                userId,
                storeId,
                productType: product.product_type,
                items: [{
                    productId: product.id,
                    specId: product.id,
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {products.map((product, index) => (
                    <section
                        key={product.id}
                        className="bg-white p-2 border-b-4 border-zinc-200 group animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Image Area - Strongly Typed Style */}
                        <div
                            className="image featured relative h-72 overflow-hidden bg-zinc-50 cursor-pointer"
                            onClick={() => openDetail(product)}
                        >
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-200 gap-4 group-hover:bg-zinc-100 transition-colors">
                                    <Package className="h-16 w-16 opacity-10" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">No Visual Asset</span>
                                </div>
                            )}

                            {/* Status Tag */}
                            <div className="absolute top-4 left-4">
                                {product.product_type === 'custom' && (
                                    <div className="bg-[#444] text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-widest shadow-xl">
                                        Custom
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Area */}
                        <div className="p-8 text-center bg-white">
                            <header className="mb-6">
                                <h3 className="text-xl font-black tracking-widest text-[#444] uppercase">{product.name}</h3>
                                <p className="text-xs font-bold text-zinc-300 mt-1 uppercase tracking-widest">{product.category_name || 'Standard Gear'}</p>
                            </header>

                            <div className="flex flex-col items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-[#ed786a] tracking-tight">{formatCurrency(product.base_price)}</span>
                                    <span className="text-[9px] font-black text-zinc-200 uppercase tracking-widest mt-1">Required Points</span>
                                </div>
                                <div className="flex w-full gap-2">
                                    <button
                                        className="flex-1 py-4 bg-[#f0f0f0] text-zinc-400 font-black text-[10px] tracking-widest uppercase hover:bg-[#ed786a] hover:text-white transition-all active:scale-95"
                                        onClick={() => openDetail(product)}
                                    >
                                        상세보기
                                    </button>
                                    <button
                                        className="flex-1 py-4 bg-[#444] text-white font-black text-[10px] tracking-widest uppercase hover:bg-[#ed786a] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOrder(product);
                                        }}
                                        disabled={loading === product.id}
                                    >
                                        {loading === product.id ? '대기중...' : '보급신청'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-30">
                        <Package className="h-20 w-20 mb-6" />
                        <p className="font-black tracking-[0.3em] uppercase text-xs italic">준비된 상품이 존재하지 않습니다.</p>
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            <ProductDetailModal
                product={selectedProduct}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                onOrder={handleOrder}
            />
        </div>
    );
}
