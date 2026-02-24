/**
 * [수정 이력]
 * - 2026-02-24 23:30: 쇼핑몰(User Shop) 페이지 신규 구현 (Vite 레거시 전환)
 * - 조치: Next.js 15 App Router 패턴 적용, Server Actions 연동, UI 컴포넌트 고도화
 */
import { getProducts } from "@/actions/products";
import { getPointSummary } from "@/actions/points";
import { createOnlineOrder } from "@/actions/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

export default async function UserShopPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string }>;
}) {
    const params = await searchParams;
    const activeTab = params.type || 'finished';

    // Mock current user ID (실제 운영 시 세션에서 추출)
    const userId = "00000000-0000-0000-0000-000000000002";

    // 데이터 fetch
    const productsResult = await getProducts({ productType: activeTab });
    const pointsResult = await getPointSummary(userId);

    const products = Array.isArray(productsResult?.data) ? productsResult.data : [];
    const pointSummary = pointsResult?.success ? pointsResult.data : null;
    const availablePoints = pointSummary ? (Number(pointSummary.total_granted || 0) - Number(pointSummary.used_points || 0) - Number(pointSummary.reserved_points || 0)) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">피복 쇼핑몰</h2>
                    <p className="text-sm text-zinc-500">포인트를 사용하여 필요한 피복을 온라인으로 주문하세요.</p>
                </div>
                <Card className="bg-[#1D4ED8] text-white border-none shadow-md">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-white/80 font-medium">나의 가용 포인트</p>
                            <p className="text-xl font-bold tracking-tight">{formatCurrency(availablePoints)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <div className="border-b border-zinc-100">
                    <nav className="flex px-6" aria-label="Tabs">
                        <a
                            href="?type=finished"
                            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'finished'
                                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                }`}
                        >
                            완제품
                        </a>
                        <a
                            href="?type=custom"
                            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'custom'
                                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                }`}
                        >
                            맞춤피복
                        </a>
                    </nav>
                </div>

                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.isArray(products) && products.map((product: any) => (
                            <Card key={product.id} className="group overflow-hidden flex flex-col hover:shadow-lg transition-all border-zinc-200">
                                <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                                    <Image
                                        src={product.image_url || 'https://placehold.co/400x300?text=No+Image'}
                                        alt={product.name}
                                        width={400}
                                        height={300}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {product.product_type === 'custom' && (
                                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
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
                                        <span className="text-lg font-black text-[#1D4ED8]">{formatCurrency(product.base_price)}</span>
                                        <form action={async () => {
                                            'use server';
                                            // Note: In real app, this would be a Client Component using useFormStatus or similar
                                            // To simplify for this step, we keep it as a server-side action trigger
                                            // await createOnlineOrder({ ... });
                                        }}>
                                            <Button size="sm" className="bg-zinc-900 hover:bg-zinc-800 h-8 gap-1.5">
                                                <ShoppingCart className="h-3.5 w-3.5" />
                                                주문
                                            </Button>
                                        </form>
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
                </CardContent>
            </Card>
        </div>
    );
}
