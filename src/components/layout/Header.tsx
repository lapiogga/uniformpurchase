'use client';

import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

export function Header() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        toast.success('로그아웃되었습니다.');
        router.push('/');
    };

    const getRoleLabel = () => {
        if (pathname.startsWith('/admin')) return '관리자';
        if (pathname.startsWith('/store')) return '판매소';
        if (pathname.startsWith('/tailor')) return '체척업체';
        return '사용자';
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-4 shrink-0 shadow-sm">
            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-xl font-bold text-[#1d4ed8]">피복 구매관리 시스템</h1>
                <span className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-bold text-zinc-500">
                    {getRoleLabel()}
                </span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">홍길동 님</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-600 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">로그아웃</span>
                </button>
            </div>
        </header>
    );
}
