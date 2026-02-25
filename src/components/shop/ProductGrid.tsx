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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <Card key={product.id} className="group overflow-hidden flex flex-col hover:shadow-lg transition-all border-zinc-200 bg-white">
                    <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                width={400}
                                height={300}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                                <Package className="h-10 w-10 opacity-20" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Image</span>
                            </div>
                        )}
                        {product.product_type === 'custom' && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                                Custom
                            </div>
                        )}
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{product.category_name || '기본분류'}</p>
                            <h3 className="font-bold text-zinc-900 leading-tight mb-1">{product.name}</h3>
                            <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                            <span className="text-lg font-black text-blue-600">{formatCurrency(product.base_price)}</span>
                            <Button
                                size="sm"
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 h-8 gap-1.5 font-bold"
                                onClick={() => handleOrder(product)}
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
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400">
                    <Package className="h-12 w-12 mb-4 opacity-10" />
                    <p>등록된 상품이 없습니다.</p>
                </div>
            )}
        </div>
    );
}
