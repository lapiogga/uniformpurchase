'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems } from '@/lib/menu-config';

interface SidebarProps {
    role: 'admin' | 'store' | 'user' | 'tailor';
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const filteredItems = navItems.filter((item) => item.roles.includes(role));

    return (
        <aside className="w-64 border-r bg-[#FAF7F2] shrink-0 hidden md:block">
            <nav className="flex flex-col gap-1 p-4">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-[4px] px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                            )}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
