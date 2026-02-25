'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems } from '@/lib/menu-config';

interface SidebarProps {
    role: 'admin' | 'store' | 'user' | 'tailor';
    isMobile?: boolean;
}

export function Sidebar({ role, isMobile }: SidebarProps) {
    const pathname = usePathname();
    const filteredItems = navItems.filter((item) => item.roles.includes(role));

    return (
        <aside className={cn(
            "w-64 border-r bg-[#FAF7F2] shrink-0 h-full",
            isMobile ? "block" : "hidden md:block"
        )}>
            <nav className="flex flex-col gap-1 p-4 h-full">
                <div className="flex-1 flex flex-col gap-1">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-[4px] px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[#1d4ed8] text-white"
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                )}
                            >
                                {item.title}
                            </Link>
                        );
                    })}
                </div>
                <div className="mt-auto pt-4 border-t border-zinc-200">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest px-3">
                        Mode: {role}
                    </p>
                </div>
            </nav>
        </aside>
    );
}
