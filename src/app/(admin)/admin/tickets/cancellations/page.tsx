import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CancellationApprovalPage() {
    // Mock data for cancellation requests
    const requests = [
        { id: 1, ticket_number: 'TKT-20260225-00012', user_name: '이순신', military_number: '20-11111', reason: '사이즈 오측정', status: 'pending' },
        { id: 2, ticket_number: 'TKT-20260225-00045', user_name: '강감찬', military_number: '21-22222', reason: '단순 변심', status: 'pending' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">체척 취소요청 승인</h2>
                <p className="text-sm text-zinc-500">사용자가 요청한 맞춤피복 체척권 취소 건을 심사합니다.</p>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="pl-6">티켓번호</TableHead>
                            <TableHead>요청자</TableHead>
                            <TableHead>사유</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead className="text-right pr-6">승인처리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell className="pl-6 font-mono text-xs">{req.ticket_number}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{req.user_name}</div>
                                    <div className="text-xs text-zinc-400">{req.military_number}</div>
                                </TableCell>
                                <TableCell className="text-sm">{req.reason}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                                        대기중
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                                            <CheckCircle className="h-4 w-4 mr-1" /> 승인
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                            <XCircle className="h-4 w-4 mr-1" /> 반려
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
