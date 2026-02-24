'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implement actual authentication login
        // For now, simple mock login
        setTimeout(() => {
            setLoading(false);
            toast.success('로그인 성공');
            router.push('/admin/dashboard');
        }, 1000);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 auth-card p-8 bg-white">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900">
                        피복 구매관리 시스템
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-600">
                        로그인하여 서비스를 이용하세요
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">이메일 주소</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1"
                                placeholder="군번@example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="/forgot-password" title="비밀번호 찾기" className="font-medium text-blue-600 hover:text-blue-500">
                                비밀번호를 잊으셨나요?
                            </a>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1d4ed8] hover:bg-blue-700"
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
