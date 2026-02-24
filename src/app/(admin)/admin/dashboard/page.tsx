import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, ShoppingBag, Ruler } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const stats = [
        { title: "전체 사용자", value: "1,240명", icon: Users, color: "text-blue-600" },
        { title: "이번 달 지급 포인트", value: "4,500,000 P", icon: CreditCard, color: "text-green-600" },
        { title: "오늘의 주문", value: "42건", icon: ShoppingBag, color: "text-purple-600" },
        { title: "미확인 체척권", value: "12건", icon: Ruler, color: "text-orange-600" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">대시보드</h2>
                <div className="text-sm text-zinc-500">2026년 2월 24일 기준</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-zinc-500 mt-1">지난 달 대비 +12%</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>최근 판매 현황</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-zinc-400 border-2 border-dashed rounded-md">
                            차트 영역 (준비 중)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>최근 주문 내역</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <div className="text-sm font-medium">홍길동 {i === 1 ? '대위' : '중사'}</div>
                                        <div className="text-xs text-zinc-500 text-ellipsis overflow-hidden">전투복 외 2종</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold">125,000 P</div>
                                        <div className="text-xs text-zinc-400 font-mono text-ellipsis overflow-hidden">ORD-2026-000{i}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
