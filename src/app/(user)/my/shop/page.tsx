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
import { ProductGrid } from "@/components/shop/ProductGrid";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function UserShopPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string }>;
}) {
    const params = await searchParams;
    const activeTab = params.type || 'finished';

    // 세션 정보 가져오기 (Server Side)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/');
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

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
                <Card className="bg-blue-600 text-white border-none shadow-lg">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-100 font-medium mb-0.5">나의 가용 포인트</p>
                            <p className="text-2xl font-black tracking-tighter">{formatCurrency(availablePoints)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-200 shadow-sm">
                <div className="border-b border-zinc-100 bg-zinc-50/50">
                    <nav className="flex px-6" aria-label="Tabs">
                        <a
                            href="?type=finished"
                            className={`py-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'finished'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-200'
                                }`}
                        >
                            완제품 쇼핑
                        </a>
                        <a
                            href="?type=custom"
                            className={`py-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'custom'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-200'
                                }`}
                        >
                            맞춤피복 신청
                        </a>
                    </nav>
                </div>

                <CardContent className="p-6">
                    <ProductGrid products={products} userId={userId} availablePoints={availablePoints} />
                </CardContent>
            </Card>
        </div>
    );
}

