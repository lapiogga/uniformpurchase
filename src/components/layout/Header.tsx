'use client';

import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function Header() {
    const router = useRouter();

    const handleLogout = () => {
        toast.success('로그아웃되었습니다.');
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-4 shrink-0 shadow-sm">
            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-xl font-bold text-primary">피복 구매관리 시스템</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <UserIcon className="h-4 w-4" />
                    <span>관리자님</span>
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
