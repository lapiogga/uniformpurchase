'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { login } from '@/actions/users';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ShoppingCart,
    User as UserIcon,
    Search,
    ChevronRight,
    ArrowRight,
    Bell,
    Package,
    Anchor,
    Waves
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

const navyImages = [
    "https://images.unsplash.com/photo-1599427303058-f06cbdf4bb91?q=80&w=1500", // 01: Modern Warship at Sea
    "https://images.unsplash.com/photo-1498623116890-394ad9239b25?q=80&w=1500", // 02: Fleet at Sunset
    "https://images.unsplash.com/photo-1505115821845-22ec358927ad?q=80&w=1500", // 03: Deep Blue Ocean Horizon
    "https://images.unsplash.com/photo-1544436024-42f0636fb482?q=80&w=1500", // 04: Tactical Naval Operation
    "https://images.unsplash.com/photo-1521404063675-9e6e02660d5c?q=80&w=1500", // 05: Ship Deck & Equipment
    "https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=1500", // 06: High-Tech Radar & Comms
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1500", // 07: Bridge Control System
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1500"  // 08: Powerful Ocean Waves
];

export default function LandingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [notices, setNotices] = useState<any[]>([]);

    useEffect(() => {
        // Fetch notices
        const fetchNotices = async () => {
            const { getNotices } = await import('@/actions/notices');
            const res = await getNotices(3);
            if (res.success) setNotices(res.data);
        };
        fetchNotices();
        console.log("Starting Slideshow Interval");
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => {
                const next = (prev + 1) % 8;
                console.log("Changing slide to:", next);
                return next;
            });
        }, 3000);
        return () => {
            console.log("Cleaning up Slideshow Interval");
            clearInterval(interval);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                localStorage.setItem('user_session', JSON.stringify(result.data));
                toast.success(`${result.data.name}님, 환영합니다.`);

                const role = result.data.role;
                if (role === 'admin') router.push('/admin/dashboard');
                else if (role === 'store') router.push('/store/dashboard');
                else if (role === 'tailor') router.push('/tailor/dashboard');
                else router.push('/shop');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-white text-black font-sans overflow-hidden flex flex-col">
            <Toaster position="top-center" expand={false} richColors />
            {/* Minimal Header */}
            <header className="border-b border-zinc-100 px-6 py-4 shrink-0 bg-white z-50">
                <div className="max-w-[1440px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="bg-[#EE1C23] text-white p-2 w-12 h-12 flex flex-col items-center justify-center font-bold leading-none shrink-0 cursor-pointer" onClick={() => router.push('/')}>
                            <span className="text-[8px] tracking-tighter">NAVY</span>
                            <span className="text-sm">PIBOK</span>
                        </div>
                        <h1 className="font-extrabold text-xl tracking-tighter">해군 디지털 피복</h1>
                    </div>
                    <div className="flex items-center gap-10">
                        <nav className="hidden lg:flex items-center gap-12 text-[14px] font-black uppercase tracking-[0.2em] text-zinc-600">
                            <span className="text-black border-b-2 border-[#EE1C23] pb-1 cursor-pointer">해상 전투복</span>
                            <span className="hover:text-black cursor-pointer transition-colors">정복/단복</span>
                            <span className="hover:text-black cursor-pointer transition-colors">함상용 기어</span>
                            <span className="hover:text-black cursor-pointer transition-colors">포인트 시스템</span>
                        </nav>
                        <Button className="h-12 px-10 bg-black text-white font-black rounded-none text-xs tracking-widest hover:bg-[#EE1C23] transition-colors" onClick={() => setIsLoginOpen(true)}>
                            로그인
                        </Button>
                    </div>
                </div>
            </header>

            {/* Compact Main Layout: Navy Focus */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* Subtle Digital Pattern Overlay (Navy Style) */}
                <div className="absolute inset-0 digital-pattern pointer-events-none opacity-[0.04]" />

                <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative z-10">

                    {/* Left: Navy Visual Slideshow (42%) */}
                    <div className="lg:col-span-5 relative h-full bg-blue-950 group border-r border-zinc-100 overflow-hidden">
                        {/* Slideshow Images */}
                        {navyImages.map((src, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "absolute inset-0 transition-all duration-[1500ms] ease-in-out",
                                    index === currentImageIndex ? "opacity-70 group-hover:opacity-100 z-10" : "opacity-0 z-0"
                                )}
                            >
                                <Image
                                    src={src}
                                    alt={`ROK Navy Visual ${index + 1}`}
                                    fill
                                    priority={index <= 1} // Preload first two
                                    className={cn(
                                        "object-cover grayscale transition-transform duration-[4000ms] ease-out",
                                        index === currentImageIndex ? "scale-100" : "scale-110"
                                    )}
                                />
                            </div>
                        ))}

                        {/* Navy Blue Tint Overlay */}
                        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply pointer-events-none group-hover:opacity-0 transition-opacity duration-[1500ms] z-20" />

                        {/* Pagination Dots for visual confirmation */}
                        <div className="absolute bottom-10 left-12 flex gap-2 z-30">
                            {navyImages.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 transition-all duration-500",
                                        i === currentImageIndex ? "w-8 bg-[#EE1C23]" : "w-3 bg-white/20"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-blue-950/95 via-blue-950/40 to-transparent text-white z-20">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 bg-[#EE1C23] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                    <Anchor className="h-4 w-4" />
                                    <span>ROK NAVY ARMS & GEAR</span>
                                </div>
                                <h2 className="text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic mb-8">Deep Blue <br /> Honor</h2>
                                <p className="text-lg lg:text-xl font-medium text-white/80 max-w-lg leading-relaxed font-dream">
                                    대한민국 해군의 필승 정신을 담은 <br />
                                    차세대 스마트 피복 시스템. <br />
                                    모든 해상 임무에 최적화된 성능을 제공합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Dashboard Menu (58%) */}
                    <div className="lg:col-span-1 flex flex-col items-center py-10 border-r border-zinc-100 bg-white">
                        <div className="flex flex-col gap-10 mt-4 h-full justify-between pb-10">
                            <div className="flex flex-col gap-10">
                                {['NAV', 'AIR', 'SUB'].map(n => (
                                    <span key={n} className="text-[9px] font-black text-zinc-200 rotate-90 tracking-widest select-none">{n}</span>
                                ))}
                            </div>
                            <Waves className="h-5 w-5 text-zinc-100" />
                        </div>
                    </div>

                    <div className="lg:col-span-6 flex flex-col overflow-y-auto bg-white p-10 space-y-10 scrollbar-hide">

                        {/* Summary Section */}
                        <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-zinc-100 pb-10">
                            <div className="space-y-8">
                                <h3 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none">해군 스마트 <br /> 통합 보급망</h3>
                                <p className="text-xl lg:text-2xl font-medium text-zinc-500 leading-[1.5] font-dream max-w-xl">
                                    함상 생활의 정갈함과 실전적 강인함의 조화. <br />
                                    공인된 정밀 공정으로 제작된 선진 피복 아카이브입니다.
                                </p>
                            </div>
                            <Button className="h-24 px-20 bg-[#EE1C23] text-white font-black rounded-none transition-all active:scale-95 text-lg uppercase italic shadow-[0_20px_50px_rgba(238,28,35,0.3)]" onClick={() => setIsLoginOpen(true)}>
                                로그인 <ArrowRight className="ml-4 h-7 w-7" />
                            </Button>
                        </div>

                        {/* Inventory Grid - Ultra Compact */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: '해상 전투복', label: '함상 공용', img: '/assets/user_hero_banner.png' },
                                { title: '해군 정복 (동/하)', label: '맞춤형 테일러링', img: '/assets/user_hero_banner.png' },
                                { title: '단복/카포크 자켓', label: '전통과 혁신', img: '/assets/user_hero_banner.png' },
                                { title: '특수 특전복', label: 'UDT/SSU 전용', img: '/assets/user_hero_banner.png' }
                            ].map((item, i) => (
                                <div key={i} className="group flex bg-zinc-50 border border-transparent hover:border-[#EE1C23] hover:bg-white transition-all cursor-pointer overflow-hidden h-32" onClick={() => setIsLoginOpen(true)}>
                                    <div className="w-1/3 relative shrink-0">
                                        <Image src={item.img} alt={item.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" />
                                        <div className="absolute inset-0 digital-pattern opacity-15" />
                                    </div>
                                    <div className="flex-1 p-5 flex flex-col justify-center gap-1">
                                        <span className="text-[9px] font-black text-[#EE1C23] uppercase tracking-widest">{item.label}</span>
                                        <h4 className="text-sm font-black tracking-tight">{item.title}</h4>
                                        <div className="flex items-center gap-1 text-zinc-300 group-hover:text-[#EE1C23] transition-colors mt-1">
                                            <span className="text-[8px] font-bold uppercase">상세보기</span>
                                            <ChevronRight className="h-2 w-2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Secondary Menu / Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-black text-white p-8 flex flex-col justify-between aspect-[2/1] cursor-pointer group" onClick={() => router.push('/tips')}>
                                <Waves className="h-7 w-7 text-[#EE1C23]" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-[#EE1C23]">Marine Life Update</p>
                                    <p className="text-sm font-bold leading-snug group-hover:underline underline-offset-4">함상 생활의 질을 높이는 <br /> 스마트 보급 시스템 활용 팁</p>
                                </div>
                            </div>
                            <div className="bg-zinc-100 p-8 flex flex-col justify-between aspect-[2/1] border border-zinc-200 cursor-pointer hover:bg-white transition-all group" onClick={() => setIsLoginOpen(true)}>
                                <Package className="h-7 w-7 text-zinc-400 group-hover:text-[#EE1C23] transition-colors" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 font-dream tracking-tighter">Order Dispatch</p>
                                    <p className="text-sm font-bold text-zinc-600 font-dream">진해/평택/강원 기지별 <br /> 실시간 수령 현황 조회</p>
                                </div>
                            </div>
                        </div>

                        {/* Absolute Footer-like minimalist info */}
                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-6 border-t border-zinc-50">
                                <span>© 2026 NAVY ARCHIVE : OCEAN EDITION</span>
                                <div className="flex gap-8">
                                    <span className="hover:text-black cursor-pointer transition-colors">이용약관</span>
                                    <span className="hover:text-black cursor-pointer transition-colors">고객지원</span>
                                </div>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-medium leading-relaxed font-dream">
                                * 본 페이지에 사용된 이미지는 공공누리(KOGL) 및 DVIDS Public Domain 라이선스를 준수하며, <br />
                                대한민국 해군 실정에 맞게 디지털 보정 및 편집 과정을 거쳐 제작되었습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Enhanced Login Dialog */}
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-white rounded-none shadow-2xl">
                    <DialogTitle className="sr-only">해군 디지털 피복 로그인</DialogTitle>
                    <div className="p-10 space-y-10 relative">
                        <div className="absolute top-0 left-0 w-full h-1 digital-pattern opacity-20" />

                        <div className="text-center space-y-4">
                            <div className="inline-block bg-[#EE1C23] text-white px-6 py-2 font-black text-sm skew-x-[-12deg]">
                                로그인
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic">LOG-IN</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-black uppercase text-zinc-400 ml-0.5 group-focus-within:text-[#EE1C23] transition-colors font-dream">군번 또는 이메일</Label>
                                    <Input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="SERVICE ID / EMAIL"
                                        className="h-12 rounded-none border-x-0 border-t-0 border-b-2 border-zinc-100 focus:border-[#EE1C23] focus:ring-0 px-0 text-lg font-bold transition-all bg-transparent placeholder:text-zinc-200"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-black uppercase text-zinc-400 ml-0.5 group-focus-within:text-[#EE1C23] transition-colors font-dream">비밀번호</Label>
                                    <Input
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="PASSWORD"
                                        className="h-12 rounded-none border-x-0 border-t-0 border-b-2 border-zinc-100 focus:border-[#EE1C23] focus:ring-0 px-0 text-lg font-bold transition-all bg-transparent placeholder:text-zinc-200"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-black text-white rounded-none font-black text-sm tracking-[0.2em] hover:bg-[#EE1C23] transition-all uppercase"
                            >
                                {loading ? '인증 중...' : '로그인'}
                            </Button>
                        </form>

                        <div className="flex justify-between items-center px-1 pt-6 border-t border-zinc-50">
                            <a href="#" className="text-[10px] font-black text-zinc-300 hover:text-black uppercase tracking-widest decoration-zinc-200 underline underline-offset-4 font-dream">비밀번호 찾기</a>
                            <a href="#" className="text-[10px] font-black text-[#EE1C23] hover:underline uppercase tracking-widest font-dream">신규 등록</a>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
