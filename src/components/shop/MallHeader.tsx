'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, LogOut, Package, Menu, X } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { logout } from '@/actions/users';
import { toast } from 'sonner';

export function MallHeader({ availablePoints }: { availablePoints: number }) {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<any>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const session = localStorage.getItem('user_session');
        if (session) setUser(JSON.parse(session));

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
        setSearchActive(false);
        setMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem('user_session');
        toast.success('로그아웃되었습니다.');
        router.push('/');
    };

    return (
        <header className={cn(
            "sticky top-0 z-[60] w-full transition-all duration-500",
            scrolled ? "bg-white/90 backdrop-blur-xl border-b border-zinc-200/50 py-3" : "bg-transparent py-5 md:py-8"
        )}>
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 text-zinc-900"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>

                {/* Logo */}
                <div className="flex items-center gap-10">
                    <h1
                        className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={() => router.push('/shop')}
                    >
                        UNIFORM<span className="gold-text-gradient ml-1">MALL</span>
                    </h1>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-10">
                        <a href="/shop?type=finished" className="text-[13px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors">기성완제품</a>
                        <a href="/shop?type=custom" className="text-[13px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors">맞춤제작</a>
                        <a href="#history" className="text-[13px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors">나의 활동</a>
                        <a href="#notices" className="text-[13px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors">새소식</a>
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 md:gap-8">
                    {/* Search Bar (Desktop) */}
                    <form
                        onSubmit={handleSearch}
                        className={cn(
                            "hidden md:flex relative items-center transition-all duration-500 ease-out",
                            searchActive ? "w-72" : "w-12"
                        )}
                    >
                        <input
                            type="text"
                            placeholder="상품 검색..."
                            className={cn(
                                "w-full h-12 pl-12 pr-4 rounded-full bg-white border border-zinc-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-gold-premium/50 transition-all",
                                !searchActive && "opacity-0 cursor-default"
                            )}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={() => !searchQuery && setSearchActive(false)}
                        />
                        <button
                            type="button"
                            onClick={() => setSearchActive(true)}
                            className="absolute left-0 w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </form>

                    {/* Points Content (Compact on Mobile) */}
                    <div className="flex items-center gap-2 md:gap-4 bg-white/50 border border-zinc-200 py-2 pl-3 md:pl-5 pr-2 rounded-full shadow-sm group hover:border-gold-premium/30 transition-all">
                        <span className="hidden sm:inline text-[11px] font-black text-zinc-400 uppercase tracking-widest">포인트</span>
                        <span className="text-sm font-black gold-text-gradient">{formatCurrency(availablePoints)}</span>
                        <div className="gold-gradient p-1.5 md:p-2 rounded-full shadow-sm">
                            <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                        </div>
                    </div>

                    <div className="hidden sm:block h-6 w-[1px] bg-zinc-200" />

                    {/* User Profile / Dashboard Link */}
                    <div className="flex items-center gap-3 md:gap-5">
                        <button
                            onClick={() => router.push('/my/shop')}
                            className="flex items-center justify-center md:justify-start gap-2 h-10 w-10 md:h-12 md:w-auto md:px-6 md:py-3 rounded-full bg-zinc-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
                            title="내 관리 화면"
                        >
                            <Package className="h-4 w-4" />
                            <span className="hidden md:inline">내 관리 화면</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-zinc-400 hover:text-red-600 transition-colors p-2"
                            title="로그아웃"
                        >
                            <LogOut className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar/Menu */}
            <div className={cn(
                "lg:hidden fixed inset-0 z-50 transition-all duration-300",
                mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                <div className={cn(
                    "absolute top-0 left-0 bottom-0 w-[280px] bg-white p-8 flex flex-col gap-10 shadow-2xl transition-transform duration-500 ease-out",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <h2 className="text-2xl font-black tracking-tighter">UNIFORM<span className="gold-text-gradient ml-1">MALL</span></h2>

                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="상품 검색..."
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-zinc-50 border-none text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-gold-premium/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                    </form>

                    <nav className="flex flex-col gap-6">
                        <a href="/shop?type=finished" className="text-lg font-black text-zinc-900 border-b border-zinc-50 pb-4" onClick={() => setMobileMenuOpen(false)}>기성완제품</a>
                        <a href="/shop?type=custom" className="text-lg font-black text-zinc-900 border-b border-zinc-50 pb-4" onClick={() => setMobileMenuOpen(false)}>맞춤제작</a>
                        <a href="#history" className="text-lg font-black text-zinc-900 border-b border-zinc-50 pb-4" onClick={() => setMobileMenuOpen(false)}>나의 활동</a>
                        <a href="#notices" className="text-lg font-black text-zinc-900 border-b border-zinc-50 pb-4" onClick={() => setMobileMenuOpen(false)}>새소식</a>
                    </nav>

                    <div className="mt-auto">
                        <button
                            onClick={() => {
                                router.push('/my/shop');
                                setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-900 text-white text-[11px] font-black uppercase tracking-widest"
                        >
                            <Package className="h-4 w-4" />
                            내 관리 화면
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
