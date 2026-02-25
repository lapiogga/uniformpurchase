import { getTailorTickets } from "@/actions/tickets";
import { getTailorSettlements } from "@/actions/settlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scissors, CheckCircle, Search, CreditCard, ArrowRight, Wallet } from "lucide-react";
import { formatCurrency, cn, getRankLabel } from "@/lib/utils";
import Link from "next/link";
import { SettlementRequestButton } from "@/components/settlements/SettlementRequestButton";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TailorDashboardPage() {
    // 세션 정보 가져오기
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/');
    }

    const session = JSON.parse(sessionCookie.value);
    const tailorId = session.tailor_id;

    if (!tailorId) {
        return <div className="p-8 text-center text-red-500 font-bold">체척업체 권한이 없는 계정입니다.</div>;
    }

    const [ticketsRes, settlementsRes] = await Promise.all([
        getTailorTickets(tailorId),
        getTailorSettlements(tailorId)
    ]);

    const tickets = Array.isArray(ticketsRes?.data) ? ticketsRes.data : [];
    const settlements = Array.isArray(settlementsRes?.data) ? settlementsRes.data : [];

    // 통계 계산
    const registeredTickets = tickets.filter((t: any) => t.status === 'registered');
    const pendingSettlementAmount = registeredTickets.length * 25000;
    const completedSettlements = settlements.filter((s: any) => s.status === 'confirmed');
    const totalSettled = completedSettlements.reduce((sum, s) => sum + s.total_amount, 0);

    const stats = [
        { title: "미정산 체척권", value: `${registeredTickets.length}건`, sub: "정산 요청 가능", icon: Scissors, color: "text-blue-600" },
        { title: "정산 예정액", value: formatCurrency(pendingSettlementAmount), sub: "요청 대기 중", icon: Wallet, color: "text-orange-600" },
        { title: "누적 정산액", value: formatCurrency(totalSettled), sub: "지급 완료 기준", icon: CreditCard, color: "text-green-600" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">업체 대시보드</h2>
                    <p className="text-sm text-zinc-500">체척 등록 현황 및 정산 요청을 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <SettlementRequestButton tailorId={tailorId} disabled={registeredTickets.length === 0} />
                    <Link href="/tailor/tickets/register">
                        <Button className="bg-[#1d4ed8] hover:bg-blue-700 gap-1.5">
                            <Search className="h-4 w-4" />
                            체척권 등록
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-zinc-400 mt-1">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                    <CardTitle className="text-lg">최근 등록 체척권</CardTitle>
                    <Link href="/tailor/tickets" className="text-sm text-[#1D4ED8] hover:underline flex items-center gap-1">
                        전체 현황 <ArrowRight className="h-3 w-3" />
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50/50">
                            <TableRow>
                                <TableHead className="pl-6">체척권 번호</TableHead>
                                <TableHead>사용자</TableHead>
                                <TableHead>대상 품목</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead className="text-right pr-6">등록일시</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.slice(0, 10).map((ticket: any) => (
                                <TableRow key={ticket.id}>
                                    <td className="pl-6 py-4 font-mono text-sm font-medium text-zinc-900">{ticket.ticket_number}</td>
                                    <td className="text-sm font-bold">
                                        {ticket.military_number} / {getRankLabel(ticket.rank)} / {ticket.user_name}
                                    </td>
                                    <td className="text-sm text-zinc-600">{ticket.product_name}</td>
                                    <td>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "font-bold",
                                                ticket.status === 'registered' ? "bg-blue-50 text-blue-700" :
                                                    ticket.status === 'settlement_requested' ? "bg-orange-50 text-orange-700" :
                                                        "bg-green-50 text-green-700"
                                            )}
                                        >
                                            {ticket.status === 'registered' ? '등록완료' :
                                                ticket.status === 'settlement_requested' ? '정산요청중' : '정산완료'}
                                        </Badge>
                                    </td>
                                    <td className="text-right pr-6 text-xs text-zinc-400 font-mono">
                                        {ticket.registered_at ? new Date(ticket.registered_at).toLocaleString() : '-'}
                                    </td>
                                </TableRow>
                            ))}
                            {tickets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-zinc-400">
                                        등록된 체척권 데이터가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

