/**
 * [수정 이력]
 * - 2026-02-25 00:10: 체척업체 대시보드(Tailor Dashboard) 페이지 구현
 * - 조치: tailoring_tickets 테이블 연동, 등록 현황 및 정산 통계 표시
 */
import { getTailorTickets } from "@/actions/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scissors, CheckCircle, Search, CreditCard, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function TailorDashboardPage() {
    // Mock tailor ID
    const tailorId = "00000000-0000-0000-0000-000000000003";

    // 데이터 fetch
    const ticketsResult = await getTailorTickets(tailorId);
    const tickets = Array.isArray(ticketsResult?.data) ? ticketsResult.data : [];

    // 통계 계산 (가정: 체척당 일정 수수료 발생)
    const settlementEstimate = (Array.isArray(tickets) ? tickets.length : 0) * 25000; // 건당 25,000원 정산 가정

    const stats = [
        { title: "등록 체척권", value: `${Array.isArray(tickets) ? tickets.length : 0}건`, sub: "전체 누적", icon: CheckCircle, color: "text-green-600" },
        { title: "정산 예정액", value: formatCurrency(settlementEstimate), sub: "이번 달 기준", icon: CreditCard, color: "text-blue-600" },
        { title: "미완료 체척", value: "0건", sub: "진행 중", icon: Scissors, color: "text-zinc-400" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">업체 대시보드</h2>
                    <p className="text-sm text-zinc-500">등록된 체척권 현황과 정산 예정 정보를 확인하세요.</p>
                </div>
                <Link href="/tailor/tickets/register">
                    <Button className="bg-zinc-900 hover:bg-zinc-800 gap-1.5">
                        <Search className="h-4 w-4" />
                        체척권 간편 등록
                    </Button>
                </Link>
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
                            {Array.isArray(tickets) && tickets.slice(0, 10).map((ticket: any) => (
                                <TableRow key={ticket.id}>
                                    <td className="pl-6 py-4 font-mono text-sm font-medium text-zinc-900">{ticket.ticket_number}</td>
                                    <td className="text-sm">{ticket.user_name}</td>
                                    <td className="text-sm text-zinc-600">{ticket.product_name}</td>
                                    <td>
                                        <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                            등록완료
                                        </Badge>
                                    </td>
                                    <td className="text-right pr-6 text-xs text-zinc-400 font-mono">
                                        {new Date(ticket.registered_at).toLocaleString()}
                                    </td>
                                </TableRow>
                            ))}
                            {(!Array.isArray(tickets) || tickets.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-zinc-400">
                                        <Scissors className="h-10 w-10 mx-auto mb-2 opacity-10" />
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
