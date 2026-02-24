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

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            toast.success('로그인 성공');

            if (email.includes('admin')) {
                router.push('/admin/dashboard');
            } else if (email.includes('store')) {
                router.push('/store/dashboard');
            } else if (email.includes('tailor')) {
                router.push('/tailor/dashboard');
            } else {
                router.push('/my/shop');
            }
        }, 800);
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

                <div className="mt-6 pt-6 border-t border-zinc-100">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">테스트 계정 (비밀번호 무관)</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-zinc-50 rounded">
                            <span className="font-bold text-zinc-700">관리자:</span><br />admin@mil.kr
                        </div>
                        <div className="p-2 bg-zinc-50 rounded">
                            <span className="font-bold text-zinc-700">일반:</span><br />hong@mil.kr
                        </div>
                        <div className="p-2 bg-zinc-50 rounded">
                            <span className="font-bold text-zinc-700">판매소:</span><br />store1@mil.kr
                        </div>
                        <div className="p-2 bg-zinc-50 rounded">
                            <span className="font-bold text-zinc-700">체척업체:</span><br />tailor1@mil.kr
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
