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
        <div className="min-h-screen bg-[#F8FAFC] -mx-4 -mt-8 px-4 pb-20 text-zinc-900 font-sans">
            {/* Hero Section - Brighter & Airy */}
            <div className="relative h-[450px] -mx-4 mb-16 overflow-hidden flex items-center justify-center bg-zinc-100">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#F8FAFC] z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1599812411674-693ed3d4922f?q=80&w=2000&auto=format&fit=crop"
                    alt="Premium Uniform Collection"
                    fill
                    className="object-cover opacity-30 contrast-[1.1] brightness-[1.05]"
                />
                <div className="relative z-20 text-center space-y-6 px-6 max-w-4xl">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-[1px] w-12 bg-gold-premium/40" />
                        <span className="text-gold-premium text-xs font-black uppercase tracking-[0.4em]">
                            Exclusively Tailored
                        </span>
                        <div className="h-[1px] w-12 bg-gold-premium/40" />
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 drop-shadow-sm leading-tight">
                        ELITE <br /> <span className="gold-text-gradient">HERITAGE</span>
                    </h2>
                    <p className="text-zinc-500 text-lg md:text-xl font-semibold max-w-2xl mx-auto leading-relaxed">
                        최정예 요원을 위한 고품격 피복 시스템. <br />
                        시간이 흘러도 변치 않는 품질과 장인정신으로 완성된 컬렉션입니다.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-16">
                {/* Points Card - High Key Premium Style */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                    <div className="space-y-3">
                        <h3 className="text-4xl font-black tracking-tight text-zinc-900 font-premium">LUXURY ARCHIVE</h3>
                        <p className="text-zinc-400 font-semibold tracking-wide">포인트를 사용하여 엄선된 피복 라이업을 만나보세요.</p>
                    </div>

                    <div className="glass-effect p-1 rounded-[2.5rem] border border-white shadow-2xl shadow-blue-900/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-gold-premium/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex items-center gap-8 px-10 py-6 relative z-10">
                            <div className="gold-gradient p-4 rounded-2xl shadow-lg ring-4 ring-white">
                                <Package className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1">Total Available Credit</p>
                                <p className="text-4xl font-black tracking-tighter gold-text-gradient">{formatCurrency(availablePoints)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-10">
                    <div className="flex border-b border-zinc-200 gap-12">
                        <a
                            href="?type=finished"
                            className={cn(
                                "py-5 text-xs font-black uppercase tracking-[0.25em] transition-all relative",
                                activeTab === 'finished'
                                    ? "text-gold-premium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold-premium"
                                    : "text-zinc-400 hover:text-zinc-900"
                            )}
                        >
                            Essentials
                        </a>
                        <a
                            href="?type=custom"
                            className={cn(
                                "py-5 text-xs font-black uppercase tracking-[0.25em] transition-all relative",
                                activeTab === 'custom'
                                    ? "text-gold-premium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold-premium"
                                    : "text-zinc-400 hover:text-zinc-900"
                            )}
                        >
                            Masterpieces
                        </a>
                    </div>

                    <ProductGrid products={products} userId={userId} availablePoints={availablePoints} />
                </div>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
import Image from "next/image";

