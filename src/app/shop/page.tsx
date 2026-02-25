/**
 * [수정 이력]
 * - 2026-02-25: HTML5UP 'Strongly Typed' 템플릿 스타일 적용
 * - 조치: 클래식하고 중후한 타이포그래피와 박스 레이아웃 도입
 */
import "./integrated-template.css";
import { getProducts } from "@/actions/products";
import { getPointSummary } from "@/actions/points";
import { getUserOnlineOrders } from "@/actions/orders";
import { getNotices } from "@/actions/notices";
import { formatCurrency, cn } from "@/lib/utils";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { MallHeader } from "@/components/shop/MallHeader";
import { FeedbackForm } from "@/components/shop/FeedbackForm";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from "next/image";
import { Bell, MessageSquare, Clock, Package, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default async function ShoppingMallPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; q?: string }>;
}) {
    const params = await searchParams;
    const activeTab = params.type || 'finished';
    const searchQuery = params.q || '';

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/');
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    const [productsResult, pointsResult, ordersResult, noticesResult] = await Promise.all([
        getProducts({ productType: activeTab }),
        getPointSummary(userId),
        getUserOnlineOrders(userId, 3),
        getNotices(5)
    ]);

    let products = Array.isArray(productsResult?.data) ? productsResult.data : [];

    if (searchQuery) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    const pointSummary = pointsResult?.success ? pointsResult.data : null;
    const availablePoints = pointSummary ? (Number(pointSummary.total_granted || 0) - Number(pointSummary.used_points || 0) - Number(pointSummary.reserved_points || 0)) : 0;

    const recentOrders = ordersResult?.success ? ordersResult.data : [];
    const recentNotices = noticesResult?.success ? noticesResult.data : [];

    return (
        <div id="page-wrapper" className="homepage bg-[#f0f0f0]">

            {/* 1. Header Section */}
            <section id="header" className="bg-white">
                <div className="container mx-auto px-10">
                    <h1 id="logo" className="text-center">
                        <a href="/shop" className="text-6xl font-black tracking-widest text-[#ed786a] uppercase hover:opacity-80 transition-opacity">
                            구매<span className="text-[#444]">몰</span>
                        </a>
                    </h1>
                    <p className="text-center text-zinc-400 mt-4 font-semibold tracking-widest uppercase">
                        대한민국 해군 프리미엄 보급 전용 아카이브
                    </p>

                    <div className="mt-12">
                        <MallHeader availablePoints={availablePoints} user={session} />
                    </div>
                </div>
            </section>

            {/* 2. Banner Section */}
            <section id="banner">
                <div className="container py-10 px-10 mx-auto text-center">
                    <p className="text-4xl font-medium tracking-tight text-white/90">
                        귀하의 현재 가용 보급 포인트는 <strong className="font-black underline underline-offset-8 decoration-4">{formatCurrency(availablePoints)}</strong> 입니다.
                    </p>
                </div>
            </section>

            {/* 3. Main Content Section (Product Grid + Sidebar) */}
            <section id="main">
                <div className="container mx-auto py-24 px-10">
                    <div className="row gtr-150 flex flex-col lg:flex-row gap-16">

                        {/* Content: Product Grid */}
                        <div id="content" className="lg:w-2/3 space-y-20">
                            <article className="box post bg-white shadow-sm ring-1 ring-zinc-100">
                                <header className="mb-12 border-b border-zinc-50 pb-8 flex items-center justify-between">
                                    <h2 className="text-4xl font-black tracking-tight text-[#444] uppercase italic">
                                        추천 <strong className="text-[#ed786a]">컬렉션</strong>
                                    </h2>
                                    <div className="flex gap-4">
                                        {['finished', 'custom'].map(type => (
                                            <a
                                                key={type}
                                                href={`/shop?type=${type}`}
                                                className={cn(
                                                    "px-6 py-2 text-xs font-black tracking-widest uppercase transition-all",
                                                    activeTab === type ? "bg-[#444] text-white" : "bg-zinc-100 text-zinc-400"
                                                )}
                                            >
                                                {type === 'finished' ? '기성제품' : '맞춤제작'}
                                            </a>
                                        ))}
                                    </div>
                                </header>

                                <ProductGrid products={products} userId={userId} availablePoints={availablePoints} />
                            </article>
                        </div>

                        {/* Sidebar: Activity & Notices */}
                        <div id="sidebar" className="lg:w-1/3 space-y-16">
                            <section className="box bg-white p-12 shadow-sm ring-1 ring-zinc-100 border-t-8 border-[#ed786a]">
                                <header className="mb-8 flex items-center gap-4">
                                    <Clock className="h-6 w-6 text-[#ed786a]" />
                                    <h3 className="text-xl font-black tracking-widest text-[#444] uppercase">최근 활동</h3>
                                </header>
                                {recentOrders.length > 0 ? (
                                    <ul className="divided space-y-8">
                                        {recentOrders.map((order: any) => (
                                            <li key={order.id} className="group">
                                                <article className="box excerpt border-b border-zinc-50 pb-6 group-hover:bg-zinc-50 transition-colors cursor-default">
                                                    <header className="mb-2">
                                                        <span className="text-[10px] font-black text-[#ed786a] tracking-[0.2em] uppercase">
                                                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                                        </span>
                                                        <h4 className="text-md font-bold text-[#444] mt-1 line-clamp-1">{order.product_names}</h4>
                                                    </header>
                                                    <p className="text-sm text-zinc-400 font-medium">#{order.order_number} • {formatCurrency(order.total_amount)}</p>
                                                </article>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-zinc-300 italic py-10 text-center">최근 주문 내역이 없습니다.</p>
                                )}
                            </section>

                            <section className="box bg-white p-12 shadow-sm ring-1 ring-zinc-100 border-t-8 border-[#444]">
                                <header className="mb-8 flex items-center gap-4">
                                    <Bell className="h-6 w-6 text-zinc-400" />
                                    <h3 className="text-xl font-black tracking-widest text-[#444] uppercase">공지사항</h3>
                                </header>
                                {recentNotices.length > 0 ? (
                                    <ul className="divided space-y-6">
                                        {recentNotices.map((notice: any) => (
                                            <li key={notice.id} className="flex items-start gap-4 group">
                                                <ChevronRight className="h-4 w-4 text-[#ed786a] mt-1 shrink-0" />
                                                <div className="space-y-1">
                                                    <a href="#" className={cn(
                                                        "text-sm font-bold group-hover:text-[#ed786a] transition-colors line-clamp-1",
                                                        notice.is_priority ? "text-red-600" : "text-zinc-500"
                                                    )}>
                                                        {notice.title}
                                                    </a>
                                                    <p className="text-[10px] text-zinc-300 uppercase tracking-widest">{format(new Date(notice.created_at), 'yyyy.MM.dd')}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-zinc-300 italic py-8 text-center">등록된 공지사항이 없습니다.</p>
                                )}
                            </section>
                        </div>

                    </div>
                </div>
            </section>

            {/* 4. Features Section (Hero Highlights - Moved below main content) */}
            <section id="features" className="bg-zinc-50 border-y border-zinc-100">
                <div className="container mx-auto py-24 px-10">
                    <header className="mb-20 text-center">
                        <h2 className="text-4xl font-black tracking-[0.2em] text-[#444] uppercase">
                            주요 <strong>보급 품목</strong>
                        </h2>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <section className="bg-white p-2 border-b-4 border-zinc-200">
                            <div className="image featured relative h-80 block overflow-hidden">
                                <Image src="https://images.unsplash.com/photo-1599427303058-f06cbdf4bb91?w=800&q=80" alt="" fill className="object-cover hover:scale-110 transition-transform duration-1000" />
                            </div>
                            <header className="p-8 text-center bg-white">
                                <h3 className="text-xl font-black tracking-widest text-[#444] uppercase">Winter Deck Gear</h3>
                                <p className="text-sm font-medium text-zinc-400 mt-2">최강의 방한 성능과 활동성</p>
                            </header>
                        </section>
                        <section className="bg-white p-2 border-b-4 border-zinc-200">
                            <div className="image featured relative h-80 block overflow-hidden">
                                <Image src="https://images.unsplash.com/photo-1521404063675-9e6e02660d5c?w=800&q=80" alt="" fill className="object-cover hover:scale-110 transition-transform duration-1000" />
                            </div>
                            <header className="p-8 text-center bg-white">
                                <h3 className="text-xl font-black tracking-widest text-[#444] uppercase">Tactical Accessories</h3>
                                <p className="text-sm font-medium text-zinc-400 mt-2">정밀한 전술 지원 장비</p>
                            </header>
                        </section>
                        <section className="bg-white p-2 border-b-4 border-zinc-200">
                            <div className="image featured relative h-80 block overflow-hidden">
                                <Image src="https://images.unsplash.com/photo-1505115821845-22ec358927ad?w=800&q=80" alt="" fill className="object-cover hover:scale-110 transition-transform duration-1000" />
                            </div>
                            <header className="p-8 text-center bg-white">
                                <h3 className="text-xl font-black tracking-widest text-[#444] uppercase">Official Uniforms</h3>
                                <p className="text-sm font-medium text-zinc-400 mt-2">해군의 품격, 맞춤 제작 정복</p>
                            </header>
                        </section>
                    </div>
                </div>
            </section>

            {/* 5. Footer Section */}
            <section id="footer" className="bg-[#222] text-white/50 py-24">
                <div className="container mx-auto px-10">
                    <header className="mb-16 text-center">
                        <h2 className="text-3xl font-black tracking-[0.3em] text-white uppercase">문의 및 <strong>의견 제출</strong></h2>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        <section className="space-y-10">
                            <p className="text-lg leading-relaxed font-dream">
                                해군 피복 보급 통합 관리 시스템은 장병들의 편의와 보급 신뢰성 확보를 최우선으로 합니다.
                                시스템 이용 관련 문의는 고객지원팀이나 예하 기지 보급관에게 요청하여 주시기 바랍니다.
                            </p>
                            <ul className="flex flex-col gap-6 text-sm font-bold tracking-widest">
                                <li className="flex items-center gap-4"><Package className="h-5 w-5" /> 대한민국 해군 보급창 통합 관리 시스템</li>
                                <li className="flex items-center gap-4"><MessageSquare className="h-5 w-5" /> support@navyarchive.mil.kr</li>
                            </ul>
                        </section>
                        <section className="bg-white/5 p-12 backdrop-blur-sm border border-white/10">
                            <FeedbackForm userId={userId} />
                        </section>
                    </div>
                </div>
            </section>

        </div>
    );
}

