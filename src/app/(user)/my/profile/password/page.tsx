'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { changePassword } from "@/actions/users";

export default function PasswordChangePage() {
    // [참고] 실제 앱에서는 세션에서 현재 사용자 ID를 가져옴
    const userId = "00000000-0000-0000-0002-000000000004"; // 홍길동 중사 Mock ID

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        if (newPassword.length < 4) {
            toast.error("비밀번호는 4자 이상이어야 합니다.");
            return;
        }

        setLoading(true);
        try {
            const result = await changePassword(userId, currentPassword, newPassword);

            if (result.success) {
                toast.success("비밀번호가 성공적으로 변경되었습니다.");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-10">
            <Card className="border-zinc-200 shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        < ShieldCheck className="h-5 w-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Security</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">비밀번호 변경</CardTitle>
                    <CardDescription>
                        계정 보안을 위해 주기적으로 비밀번호를 변경해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current">현재 비밀번호</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="current"
                                    type="password"
                                    className="pl-10"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new">새 비밀번호</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="new"
                                    type="password"
                                    className="pl-10"
                                    placeholder="8자 이상 입력"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm">새 비밀번호 확인</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="confirm"
                                    type="password"
                                    className="pl-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#1d4ed8] hover:bg-blue-700 mt-6"
                            disabled={loading}
                        >
                            {loading ? "변경 중..." : "비밀번호 변경"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
