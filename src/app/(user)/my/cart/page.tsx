/**
 * [수정 이력]
 * - 2026-02-24 23:50: 장바구니 페이지(Cart) 초기 구현
 * - 조치: 레이아웃 구성 및 대기 화면 제공
 */
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function UserCartPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">장바구니</h2>
                <p className="text-sm text-zinc-500">구매를 위해 담아둔 피복 목록입니다.</p>
            </div>

            <Card className="flex flex-col items-center justify-center p-20 text-zinc-400 border-dashed">
                <ShoppingCart className="h-16 w-16 mb-4 opacity-10" />
                <p className="text-lg font-medium">장바구니가 비어 있습니다.</p>
                <p className="text-sm mt-1">쇼핑몰에서 원하는 피복을 담아보세요.</p>
            </Card>
        </div>
    );
}
