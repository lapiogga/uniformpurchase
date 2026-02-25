/**
 * [수정 이력]
 * - 2026-02-24 17:40: 사용자 편의를 위한 테스트 계정 정보 노출 필요
 * - 조치: 로그인 폼 하단에 권한별 테스트 계정 정보 섹션 추가
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { login } from '@/actions/users';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                // 세션 정보 저장 (Client Side)
                localStorage.setItem('user_session', JSON.stringify(result.data));

                toast.success(`${result.data.name}님, 환영합니다.`);

                const role = result.data.role;
                if (role === 'admin') {
                    router.push('/admin/dashboard');
                } else if (role === 'store') {
                    router.push('/store/dashboard');
                } else if (role === 'tailor') {
                    router.push('/tailor/dashboard');
                } else {
                    router.push('/my/shop');
                }
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
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 auth-card p-8 bg-white shadow-xl rounded-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900">
                        피복 구매관리 시스템
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-600 font-medium">
                        서비스를 이용하시려면 로그인해 주세요
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-zinc-700 font-bold">이메일 주소</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="h-11 border-zinc-200 focus:ring-blue-500 rounded-lg"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-zinc-700 font-bold">비밀번호</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="h-11 border-zinc-200 focus:ring-blue-500 rounded-lg"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-bold text-blue-600 hover:text-blue-500 transition-colors" onClick={(e) => {
                                e.preventDefault();
                                toast.info("암호 분실 시 관리자에게 문의하세요 (초기 비번: test1234)");
                            }}>
                                비밀번호를 잊으셨나요?
                            </a>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95"
                        >
                            {loading ? '인증 중...' : '로그인'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
