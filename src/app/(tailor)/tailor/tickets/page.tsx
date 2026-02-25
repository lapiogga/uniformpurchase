import { getTailorTickets } from "@/actions/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Scissors } from "lucide-react";
import { formatCurrency, cn, getRankLabel } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function TailorTicketsPage() {
    // Mock tailor ID
    const tailorId = "00000000-0000-0000-0000-000000000003";

    const result = await getTailorTickets(tailorId);
    const tickets = result.success ? (result.data || []) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">체척 및 정산 현황</h2>
                    <p className="text-sm text-zinc-500">부대 용사가 방문하여 체척을 완료한 전체 목록입니다.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">전체 체척권 리스트</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50 font-bold">
                            <TableRow>
                                <TableHead className="pl-6">체척권 번호</TableHead>
                                <TableHead>사용자 성명</TableHead>
                                <TableHead>대상 품목</TableHead>
                                <TableHead className="text-center">상태</TableHead>
                                <TableHead className="text-right pr-6">등록(체척)일시</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-zinc-400">
                                        <Scissors className="h-10 w-10 mx-auto mb-2 opacity-10" />
                                        등록된 체척권이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket: any) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="pl-6 font-mono text-xs font-bold text-blue-600">{ticket.ticket_number}</TableCell>
                                        <TableCell className="text-sm font-bold text-zinc-900">
                                            {ticket.military_number} / {getRankLabel(ticket.rank)} / {ticket.user_name}
                                        </TableCell>
                                        <TableCell className="text-sm text-zinc-600">{ticket.product_name}</TableCell>
                                        <td className="text-center">
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
                                        <TableCell className="text-right pr-6 text-xs text-zinc-500 font-mono">
                                            {ticket.registered_at ? new Date(ticket.registered_at).toLocaleString() : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
