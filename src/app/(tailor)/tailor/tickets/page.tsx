/**
 * [수정 이력]
 * - 2026-02-25 00:15: 체척권 현황 페이지 구현
 * - 조치: getTailorTickets Server Action 연동 및 테이블 UI 구성
 */
import { getTailorTickets } from "@/actions/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Scissors } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TailorTicketsPage() {
    // Mock tailor ID
    const tailorId = "00000000-0000-0000-0000-000000000003";

    const result = await getTailorTickets(tailorId);
    const tickets = result.success ? result.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">등록 현황</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">체척 성공 리스트</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50">
                            <TableRow>
                                <TableHead className="pl-6">체척권 번호</TableHead>
                                <TableHead>사용자</TableHead>
                                <TableHead>대상 품목</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead className="text-right pr-6">등록(체척)일시</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!Array.isArray(tickets) || tickets.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-zinc-400">
                                        <Scissors className="h-10 w-10 mx-auto mb-2 opacity-10" />
                                        등록된 체척권이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                Array.isArray(tickets) && tickets.map((ticket: any) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="pl-6 font-mono text-sm">{ticket.ticket_number}</TableCell>
                                        <TableCell className="text-sm font-medium">{ticket.user_name}</TableCell>
                                        <TableCell className="text-sm text-zinc-600">{ticket.product_name}</TableCell>
                                        <td>
                                            <Badge variant={"success" as any}>
                                                등록완료
                                            </Badge>
                                        </td>
                                        <TableCell className="text-right pr-6 text-xs text-zinc-400">
                                            {new Date(ticket.registered_at).toLocaleString()}
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
