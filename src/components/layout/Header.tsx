'use client';

import { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { getRankLabel } from '@/lib/utils';
import { logout } from '@/actions/users';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

export function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const session = localStorage.getItem('user_session');
        if (session) {
            setUser(JSON.parse(session));
        }
    }, []);

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem('user_session');
        toast.success('로그아웃되었습니다.');
        router.push('/');
    };

    const getRole = (): 'admin' | 'store' | 'user' | 'tailor' => {
        if (pathname.startsWith('/admin')) return 'admin';
        if (pathname.startsWith('/store')) return 'store';
        if (pathname.startsWith('/tailor')) return 'tailor';
        return 'user';
    };

    const getRoleLabel = () => {
        const role = getRole();
        if (role === 'admin') return '관리자';
        if (role === 'store') return '판매소';
        if (role === 'tailor') return '체척업체';
        return '사용자';
    };

    const getUserName = () => {
        if (!user) return '로딩 중...';
        const rankLabel = user.rank ? getRankLabel(user.rank) : '';
        return `${rankLabel} ${user.name} 님`.trim();
    };

    const isShop = pathname.startsWith('/shop');
    const hasSidebar = ['admin', 'store', 'tailor'].includes(getRole());

    return (
        <header className={cn(
            "sticky top-0 z-50 flex h-16 items-center px-4 md:px-6 shrink-0 transition-all duration-300",
            isShop
                ? "glass-effect border-b border-zinc-200/50"
                : "bg-white border-b border-zinc-200 text-zinc-900 shadow-sm"
        )}>
            <div className="flex flex-1 items-center gap-2 md:gap-4">
                {hasSidebar && (
                    <div className="md:hidden mr-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                                    <Menu className="h-6 w-6" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64 border-none">
                                <Sidebar role={getRole()} isMobile />
                            </SheetContent>
                        </Sheet>
                    </div>
                )}
                <h1 className={cn(
                    "text-lg md:text-xl font-black tracking-tighter",
                    isShop ? "gold-text-gradient" : "text-blue-700"
                )}>
                    UNIFORM LUXE
                </h1>
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                    isShop ? "bg-gold-premium/10 text-gold-premium" : "bg-zinc-100 text-zinc-500"
                )}>
                    {getRoleLabel()}
                </span>
                {!pathname.startsWith('/admin') && !pathname.startsWith('/store') && !pathname.startsWith('/tailor') && (
                    <button
                        onClick={() => router.push('/shop')}
                        className="ml-2 md:ml-4 text-[10px] font-black uppercase tracking-[0.2em] text-gold-premium hover:underline decoration-2 underline-offset-4"
                    >
                        Premium Mall →
                    </button>
                )}
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5 text-sm font-bold">
                    <UserIcon className={cn("h-4 w-4", isShop ? "text-gold-premium" : "text-zinc-400")} />
                    <span className={cn("hidden sm:inline", isShop ? "text-zinc-900" : "text-zinc-700")}>{getUserName()}</span>
                </div>
                <div className={cn("h-4 w-[1px]", isShop ? "bg-zinc-200" : "bg-zinc-200")} />
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex items-center gap-2 text-sm font-bold transition-colors",
                        isShop ? "text-zinc-500 hover:text-zinc-900" : "text-zinc-500 hover:text-red-600"
                    )}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">LOGOUT</span>
                </button>
            </div>
        </header>
    );
}

import { cn } from '@/lib/utils';
