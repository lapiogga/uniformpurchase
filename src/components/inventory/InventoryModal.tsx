'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { X, Save, AlertCircle } from "lucide-react";
import { adjustInventory } from "@/actions/inventory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function InventoryModal({
    isOpen,
    onClose,
    item,
    type
}: {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    type: 'incoming' | 'adjust';
}) {
    const router = useRouter();
    const [quantity, setQuantity] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !item) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(quantity);
        if (isNaN(qty) || (type === 'incoming' && qty <= 0)) {
            toast.error("올바른 수량을 입력하세요.");
            return;
        }

        if (type === 'adjust' && item.quantity + qty < 0) {
            toast.error("재고는 0보다 작을 수 없습니다.");
            return;
        }

        setLoading(true);
        try {
            const res = await adjustInventory({
                inventoryId: item.id,
                changeQuantity: qty,
                type: type === 'incoming' ? 'incoming' : (qty > 0 ? 'adjust_up' : 'adjust_down'),
                reason: reason || (type === 'incoming' ? '정기 입고 처리' : '현장 수동 조정')
            });

            if (res.success) {
                toast.success(type === 'incoming' ? "입고가 완료되었습니다." : "재고가 조정되었습니다.");
                router.refresh();
                onClose();
            } else {
                toast.error(res.error || "처리 중 오류 발생");
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md shadow-2xl border-none">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {type === 'incoming' ? (
                                <><span className="w-2 h-6 bg-blue-500 rounded-full"></span> 입고 등록</>
                            ) : (
                                <><span className="w-2 h-6 bg-orange-500 rounded-full"></span> 재고 조정</>
                            )}
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} type="button">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 mb-2">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">대상 품목</p>
                            <p className="font-bold text-zinc-900">{item.product_name}</p>
                            <p className="text-sm text-zinc-600">{item.spec_name} (현재고: {item.quantity})</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">
                                {type === 'incoming' ? '입고 수량' : '조정 수량 (예: +10 또는 -5)'}
                            </Label>
                            <Input
                                id="quantity"
                                type="text"
                                placeholder={type === 'incoming' ? "수량 입력" : "+10 / -5"}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">사유</Label>
                            <Input
                                id="reason"
                                placeholder="작업 사유를 입력하세요 (선택)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 border-t pt-4">
                        <Button variant="outline" className="flex-1" onClick={onClose} type="button">취소</Button>
                        <Button
                            className={cn("flex-1 font-bold", type === 'incoming' ? "bg-blue-600" : "bg-orange-600")}
                            disabled={loading}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? "처리중..." : "확인"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
