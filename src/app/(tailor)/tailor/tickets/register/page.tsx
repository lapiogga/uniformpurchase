'use client';

import { useState } from 'react';
import { getTicketByNumber, registerTicket } from '@/actions/tickets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Scissors, CheckCircle, Search, CreditCard, ArrowRight, Wallet } from "lucide-react";
import { formatCurrency, cn, getRankLabel } from "@/lib/utils";
import Link from "next/link";
import { SettlementRequestButton } from "@/components/settlements/SettlementRequestButton";
export default function TicketRegisterPage() {
    const [ticketNumber, setTicketNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);

    const handleSearch = async () => {
        if (!ticketNumber) {
            toast.error('체척권 번호를 입력해주세요.');
            return;
        }
        setLoading(true);
        const result = await getTicketByNumber(ticketNumber);
        setLoading(false);

        if (result.success) {
            setTicketData(result.data);
        } else {
            toast.error(result.error);
            setTicketData(null);
        }
    };

    const handleRegister = async () => {
        if (!ticketData) return;
        setLoading(true);
        // Mock tailor ID
        const tailorId = "00000000-0000-0000-0000-000000000003";
        const result = await registerTicket(ticketData.id, tailorId);
        setLoading(false);

        if (result.success) {
            toast.success('체척권이 성공적으로 등록되었습니다.');
            setTicketData(null);
            setTicketNumber('');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">체척권 등록</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">체척권 번호 조회</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                placeholder="TKT-YYYYMMDD-NNNNN"
                                value={ticketNumber}
                                onChange={(e) => setTicketNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={loading} className="bg-zinc-800 hover:bg-zinc-700">
                            <Search className="mr-2 h-4 w-4" />
                            조회
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {ticketData && (
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardHeader className="bg-white border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">조회된 체척권 정보</CardTitle>
                            <Badge variant={ticketData.status === 'issued' ? 'secondary' : 'default'}>
                                {ticketData.status === 'issued' ? '등록가능' : ticketData.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 bg-white">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-zinc-500">사용자 정보</Label>
                                    <p className="text-lg font-bold">
                                        {ticketData.military_number} / {getRankLabel(ticketData.rank)} / {ticketData.user_name}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-zinc-500">요청 품목</Label>
                                    <p className="text-lg font-bold">{ticketData.product_name}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-zinc-500">체척권 번호</Label>
                                    <p className="text-sm font-mono bg-zinc-100 p-1 rounded inline-block">
                                        {ticketData.ticket_number}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-zinc-500">발행일시</Label>
                                    <p className="text-sm">{new Date(ticketData.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button
                                onClick={handleRegister}
                                disabled={loading || ticketData.status !== 'issued'}
                                className="bg-[#1d4ed8] px-8"
                            >
                                <Scissors className="mr-2 h-4 w-4" />
                                체척권 등록 (제작 시작)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!ticketData && (
                <div className="flex flex-col items-center justify-center p-20 text-zinc-400 border-2 border-dashed rounded-lg bg-zinc-50/50">
                    <Scissors className="h-10 w-10 mb-4 opacity-10" />
                    <p>체척권 번호를 입력하여 상세 정보를 확인하세요.</p>
                </div>
            )}
        </div>
    );
}
