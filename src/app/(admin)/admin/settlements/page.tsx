import { query } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TailorSettlementPage() {
    // Mock data for tailor settlements
    const settlements = [
        { id: 1, tailor_name: '서울양복점', period: '2026-02', count: 15, amount: 2250000, status: 'pending' },
        { id: 2, tailor_name: '부산의류', period: '2026-02', count: 8, amount: 1200000, status: 'pending' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">업체 정산관리</h2>
                    <p className="text-sm text-zinc-500">맞춤피복 제작 업체의 정산 요청 내역을 관리합니다.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    엑셀 다운로드
                </Button>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="pl-6">정산대상 업체</TableHead>
                            <TableHead>정산월</TableHead>
                            <TableHead className="text-right">체척 건수</TableHead>
                            <TableHead className="text-right">정산 금액</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead className="text-right pr-6">처리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {settlements.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell className="pl-6 font-bold">{s.tailor_name}</TableCell>
                                <TableCell>{s.period}</TableCell>
                                <TableCell className="text-right">{s.count} 건</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(s.amount)}</TableCell>
                                <TableCell>
                                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">정산검토중</span>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button size="sm" className="bg-[#1d4ed8]">
                                        <FileText className="h-4 w-4 mr-1" /> 정산확정
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
