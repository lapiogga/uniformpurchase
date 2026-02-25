'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingBag, LogOut, Package, Menu, X, Home, Info, HelpCircle, User } from 'lucide-react';
import { cn, formatCurrency, getRankLabel } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { logout } from '@/actions/users';
import { toast } from 'sonner';

export function MallHeader({ availablePoints, user }: { availablePoints: number; user: any }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
    };

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem('user_session');
        toast.success('로그아웃되었습니다.');
        router.push('/');
    };

    return (
        <nav id="nav" className="flex justify-center items-center py-4 border-y border-zinc-100">
            <ul className="flex items-center gap-1">
                <li className="group">
                    <a onClick={() => router.push('/shop')} className="cursor-pointer flex flex-col items-center px-8 py-3 transition-all hover:bg-[#ed786a] group-hover:text-white">
                        <Home className="h-5 w-5 mb-2" />
                        <span className="text-xs font-black tracking-widest uppercase">보급 메인</span>
                    </a>
                </li>
                <li className="relative group">
                    <a className="cursor-pointer flex flex-col items-center px-8 py-3 transition-all hover:bg-[#ed786a] group-hover:text-white">
                        <Menu className="h-5 w-5 mb-2" />
                        <span className="text-xs font-black tracking-widest uppercase">카테고리</span>
                    </a>
                    {/* Simplified Dropdown Placeholder */}
                    <ul className="absolute top-full left-0 w-48 bg-[#444] text-white hidden group-hover:block z-50">
                        <li className="p-4 hover:bg-[#ed786a] text-[10px] font-black tracking-widest uppercase border-b border-white/5 active:scale-95" onClick={() => router.push('/shop?type=finished')}>기성제품</li>
                        <li className="p-4 hover:bg-[#ed786a] text-[10px] font-black tracking-widest uppercase active:scale-95" onClick={() => router.push('/shop?type=custom')}>맞춤제작</li>
                    </ul>
                </li>
                <li className="group">
                    <div className="flex flex-col items-center px-8 py-2 min-w-[250px]">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder="보급품 검색..."
                                className="w-full bg-zinc-100 border-none p-3 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-[#ed786a]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-300" />
                        </form>
                    </div>
                </li>
                <li className="group">
                    <a onClick={() => router.push('/my/shop')} className="cursor-pointer flex flex-col items-center px-8 py-3 transition-all hover:bg-[#ed786a] group-hover:text-white">
                        <Package className="h-5 w-5 mb-2" />
                        <span className="text-xs font-black tracking-widest uppercase">나의 보급이력</span>
                    </a>
                </li>
                {user && (
                    <li className="flex items-center px-8 border-l border-zinc-100">
                        <div className="text-right">
                            <span className="block text-[10px] font-black text-zinc-300 uppercase tracking-widest">{getRankLabel(user.rank)}</span>
                            <span className="block text-sm font-black text-[#444] tracking-tight">{user.name}</span>
                        </div>
                    </li>
                )}
                <li className="group">
                    <a onClick={handleLogout} className="cursor-pointer flex flex-col items-center px-8 py-3 transition-all hover:bg-[#ed786a] group-hover:text-white">
                        <LogOut className="h-5 w-5 mb-2" />
                        <span className="text-xs font-black tracking-widest uppercase">로그아웃</span>
                    </a>
                </li>
            </ul>
        </nav>
    );
}
