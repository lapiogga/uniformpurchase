/**
 * [수정 이력]
 * - 2026-02-25: 신규 프리미엄 쇼핑몰(Mall) 전용 페이지 구축
 * - 조치: 검색, 필터, 장바구니 기능이 통합된 현대적인 e-commerce 레이아웃 적용
 */
import { getProducts } from "@/actions/products";
import { getPointSummary } from "@/actions/points";
import { formatCurrency } from "@/lib/utils";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { MallHeader } from "@/components/shop/MallHeader";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from "next/image";
import { Bell, MessageSquare, ChevronRight, Clock, RefreshCw, Package } from "lucide-react";

export default async function ShoppingMallPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; q?: string }>;
}) {
    const params = await searchParams;
    const activeTab = params.type || 'finished';
    const searchQuery = params.q || '';

    // 세션 정보 확인 (로그인 필수인 쇼핑몰 가정)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/');
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    // 데이터 fetch (검색어 포함)
    const productsResult = await getProducts({ productType: activeTab });
    const pointsResult = await getPointSummary(userId);

    let products = Array.isArray(productsResult?.data) ? productsResult.data : [];

    // 클라이언트 사이드 검색이 아닌 서버 사이드 필터링 (간이)
    if (searchQuery) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    const pointSummary = pointsResult?.success ? pointsResult.data : null;
    const availablePoints = pointSummary ? (Number(pointSummary.total_granted || 0) - Number(pointSummary.used_points || 0) - Number(pointSummary.reserved_points || 0)) : 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 text-zinc-900 font-sans">
            {/* 전용 헤더 (검색 및 장바구니 포함) */}
            <MallHeader availablePoints={availablePoints} />

            <main className="max-w-7xl mx-auto px-6 space-y-16 mt-8">
                {/* 히어로 섹션 */}
                <div className="relative h-[20rem] md:h-[28rem] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden flex items-center mb-10 md:mb-16 shadow-2xl">
                    <Image
                        src="/assets/user_hero_banner.png"
                        alt="Premium Banner"
                        fill
                        className="object-cover brightness-75 scale-105 active:scale-100 transition-transform duration-[3s]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="relative z-20 w-full px-8 md:px-20 space-y-6 md:space-y-10">
                        <div className="space-y-4 md:space-y-6">
                            <span className="text-gold-premium text-xs md:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.5em] block animate-in fade-in slide-in-from-left duration-700">
                                2026 연간 프리미엄 셀렉션
                            </span>
                            <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9] md:leading-[0.85] drop-shadow-2xl animate-in fade-in slide-in-from-left duration-1000 delay-100">
                                명작의 품격, <br /> <span className="gold-text-gradient">일상이 예술이 되다</span>
                            </h2>
                        </div>
                        <p className="text-zinc-200 text-lg md:text-2xl font-medium max-w-2xl leading-relaxed animate-in fade-in slide-in-from-left duration-1000 delay-200">
                            최고급 소재와 장인의 손길로 완성된 독보적인 컬렉션. <br className="hidden md:block" />
                            당신의 명예를 증명하는 단 하나의 유니폼을 경험하세요.
                        </p>
                        <div className="flex gap-4 md:gap-6 pt-4 md:pt-6 animate-in fade-in slide-in-from-left duration-1000 delay-300">
                            <button className="gold-gradient text-white px-8 md:px-12 py-4 md:py-6 rounded-full font-black text-xs md:text-sm tracking-widest shadow-2xl shadow-gold-premium/40 hover:brightness-110 active:scale-95 transition-all">
                                지금 바로 둘러보기
                            </button>
                        </div>
                    </div>
                </div>

                {/* 상품 리스트 섹션 */}
                <div className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-zinc-200 pb-10">
                        <div className="space-y-3">
                            <h3 className="text-4xl font-black tracking-tighter text-zinc-900 font-premium">프리미엄 갤러리</h3>
                            <p className="text-zinc-600 text-lg font-semibold tracking-wide">완벽한 품질을 지향하는 최상의 피복 라인업입니다.</p>
                        </div>

                        <div className="flex items-center gap-5 bg-white p-1.5 rounded-full shadow-xl border border-zinc-100">
                            <a
                                href="?type=finished"
                                className={`px-10 py-4 rounded-full text-[13px] font-black tracking-widest transition-all ${activeTab === 'finished' ? 'gold-gradient text-white' : 'text-zinc-400 hover:text-zinc-900'
                                    }`}
                            >
                                기성완제품
                            </a>
                            <a
                                href="?type=custom"
                                className={`px-10 py-4 rounded-full text-[13px] font-black tracking-widest transition-all ${activeTab === 'custom' ? 'gold-gradient text-white' : 'text-zinc-400 hover:text-zinc-900'
                                    }`}
                            >
                                맞춤제작
                            </a>
                        </div>
                    </div>

                    <ProductGrid products={products} userId={userId} availablePoints={availablePoints} />
                </div>

                {/* 나의 활동 내역 (History) */}
                <div id="history" className="pt-16 md:pt-24 space-y-8 md:space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="p-3 md:p-4 bg-zinc-900 rounded-2xl md:rounded-[1.5rem] shadow-xl">
                                <Clock className="h-5 w-5 md:h-6 md:w-6 text-gold-premium" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900">나의 프리미엄 활동</h4>
                                <p className="text-zinc-500 font-bold text-xs md:text-sm uppercase tracking-widest">포인트 및 주문 이력</p>
                            </div>
                        </div>
                        <button className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest bg-zinc-50 px-5 py-3 rounded-full w-fit">
                            <RefreshCw className="h-3.5 w-3.5" />
                            내역 새로고침
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* 최근 주문 내역 */}
                        <div className="md:col-span-2 glass-effect rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-white shadow-2xl space-y-6 md:space-y-8">
                            <h5 className="text-lg md:text-xl font-black tracking-tight text-zinc-900">최근 구매 목록</h5>
                            <div className="space-y-4 md:space-y-6">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-white/40 rounded-2xl md:rounded-3xl border border-zinc-100 hover:border-gold-premium/20 transition-all group gap-4">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="h-12 w-12 md:h-16 md:w-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                                <Package className="h-6 w-6 md:h-8 md:w-8 text-zinc-100" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs md:text-sm font-black text-zinc-900 uppercase">프리미엄 다목적 재킷</p>
                                                <p className="text-[10px] md:text-[11px] font-bold text-zinc-400">2026.02.24 | 배송 준비 중</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                                            <p className="text-lg font-black gold-text-gradient tracking-tighter">1,250P</p>
                                            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest sm:mt-1">구매 완료</p>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-4 md:py-5 text-[10px] md:text-[11px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest bg-zinc-50/50 rounded-2xl">전체 활동 내역 보기</button>
                            </div>
                        </div>

                        {/* 최근 포인트 적립 */}
                        <div className="glass-effect rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-white shadow-2xl space-y-6 md:space-y-8">
                            <h5 className="text-lg md:text-xl font-black tracking-tight text-zinc-900">포인트 적립 현황</h5>
                            <div className="space-y-4 md:space-y-6">
                                {[
                                    { title: "분기 보급 포인트 지급", amount: "+5,000P", date: "2026.01.01" },
                                    { title: "임무 수행 특별 격려금", amount: "+1,200P", date: "2026.02.15" },
                                    { title: "피복 반납 환급금", amount: "+350P", date: "2026.02.20" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 md:p-5 bg-white/40 rounded-xl md:rounded-2xl border border-zinc-50">
                                        <div className="space-y-1">
                                            <p className="text-[11px] md:text-xs font-black text-zinc-700">{item.title}</p>
                                            <p className="text-[9px] md:text-[10px] font-bold text-zinc-400">{item.date}</p>
                                        </div>
                                        <span className="text-xs md:text-sm font-black text-emerald-600">{item.amount}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4">
                                <div className="bg-zinc-900 rounded-2xl md:rounded-3xl p-5 md:p-6 space-y-1 md:space-y-2 text-center shadow-xl">
                                    <p className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Assets</p>
                                    <p className="text-2xl md:text-3xl font-black text-white tracking-tighter">{formatCurrency(availablePoints)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* News & Q&A Section */}
                <div id="notices" className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-24">
                    {/* 공지사항 (Notice) */}
                    <div className="glass-effect rounded-[3rem] p-12 space-y-10 border border-white shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-blue-50 rounded-[1.5rem]">
                                    <Bell className="h-6 w-6 text-blue-600" />
                                </div>
                                <h4 className="text-2xl font-black tracking-tight text-zinc-900">공지사항</h4>
                            </div>
                            <button className="text-[11px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">전체보기 +</button>
                        </div>
                        <div className="space-y-6">
                            {[
                                { title: "2026 SS 프리미엄 라인업 신규 입고 안내", date: "2026.02.25", tag: "신상" },
                                { title: "기성완제품 하계 정복 재고 보충 안내", date: "2026.02.22", tag: "재고" },
                                { title: "포인트 결제 시스템 서버 점검 공지 (02/28)", date: "2026.02.20", tag: "점검" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-zinc-50/50 rounded-2xl transition-all">
                                    <div className="flex items-center gap-5">
                                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${item.tag === '신상' ? 'bg-gold-premium/10 text-gold-premium' : 'bg-zinc-100 text-zinc-500'
                                            }`}>{item.tag}</span>
                                        <p className="text-base font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors line-clamp-1">{item.title}</p>
                                    </div>
                                    <span className="text-[11px] font-bold text-zinc-300 whitespace-nowrap">{item.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 문의하기 (Q&A) */}
                    <div className="glass-effect rounded-[3rem] p-12 space-y-10 border border-white shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-gold-premium/5 rounded-[1.5rem]">
                                    <MessageSquare className="h-6 w-6 text-gold-premium" />
                                </div>
                                <h4 className="text-2xl font-black tracking-tight text-zinc-900">문의하기</h4>
                            </div>
                            <button className="text-[11px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">내 문의내역</button>
                        </div>
                        <div className="space-y-8">
                            <p className="text-lg text-zinc-500 font-medium leading-relaxed">
                                상품 정보나 주문 처리에 대해 궁금하신 점이 있으신가요? <br />
                                담당 테일러가 직접 정성껏 답변해 드립니다.
                            </p>
                            <div className="flex gap-4">
                                <button className="flex-1 py-5 bg-white border border-zinc-100 rounded-3xl text-[13px] font-black text-zinc-900 shadow-sm hover:shadow-lg transition-all active:scale-95">
                                    자주 묻는 질문(FAQ)
                                </button>
                                <button className="flex-1 py-5 gold-gradient text-white rounded-3xl text-[13px] font-black shadow-2xl shadow-gold-premium/20 hover:brightness-110 transition-all active:scale-95">
                                    1:1 온라인 상담
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
