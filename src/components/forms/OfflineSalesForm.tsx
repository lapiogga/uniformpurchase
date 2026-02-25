'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, User, ShoppingCart, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers } from '@/actions/users';
import { getPointSummary } from '@/actions/points';
import { getInventory } from '@/actions/inventory';
import { createOfflineOrder } from '@/actions/orders';
import { formatCurrency, cn, getRankLabel } from '@/lib/utils';

export function OfflineSalesForm({ storeId }: { storeId: string }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // 1단계: 사용자 검색
    const [userSearch, setUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userPoints, setUserPoints] = useState<any>(null);

    // 2단계: 품목 선택
    const [inventorySearch, setInventorySearch] = useState('');
    const [inventory, setInventory] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);

    const handleUserSearch = async () => {
        if (!userSearch) return;
        setLoading(true);
        const res = await getUsers({ search: userSearch, role: 'user' });
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const user = res.data[0];
            setSelectedUser(user);
            const pRes = await getPointSummary(user.id);
            if (pRes.success) setUserPoints(pRes.data);
            setStep(2);
        } else {
            toast.error("사용자를 찾을 수 없습니다.");
        }
        setLoading(false);
    };

    const handleInventorySearch = async () => {
        const res = await getInventory(storeId, { search: inventorySearch });
        if (res.success) setInventory(res.data || []);
    };

    const addToCart = (item: any) => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
            updateQuantity(item.id, existing.quantity + 1);
        } else {
            setCart([...cart, { ...item, quantity: 1, unitPrice: (item.price || 0) }]);
        }
        toast.success(`${item.product_name} 추가됨`);
    };

    const updateQuantity = (id: string, newQty: number) => {
        if (newQty < 1) return;
        setCart(cart.map(c => c.id === id ? { ...c, quantity: newQty } : c));
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(c => c.id !== id));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const availablePoints = userPoints ? (userPoints.total_granted - userPoints.used_points - userPoints.reserved_points) : 0;

    const handleSubmit = async () => {
        if (totalAmount > availablePoints) {
            toast.error("가용 포인트가 부족합니다.");
            return;
        }

        setLoading(true);
        try {
            const res = await createOfflineOrder({
                userId: selectedUser.id,
                storeId,
                items: cart.map(c => ({
                    productId: c.product_id,
                    specId: c.spec_id,
                    quantity: c.quantity,
                    unitPrice: c.unitPrice
                }))
            });

            if (res.success) {
                toast.success("판매가 완료되었습니다.");
                router.push('/store/dashboard');
                router.refresh();
            } else {
                toast.error(res.error || "판매 처리 실패");
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (step === 1) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>구매자 검색</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>성명 또는 군번</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="예: 홍길동"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                            />
                            <Button onClick={handleUserSearch} disabled={loading}>검색</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">품목 검색 및 추가</CardTitle>
                        <div className="flex gap-2">
                            <Input
                                placeholder="품목명 검색..."
                                className="w-64"
                                value={inventorySearch}
                                onChange={(e) => setInventorySearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInventorySearch()}
                            />
                            <Button variant="secondary" onClick={handleInventorySearch}>검색</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">품목명 (규격)</TableHead>
                                    <TableHead className="text-right">단가</TableHead>
                                    <TableHead className="text-right pr-6">추가</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="pl-6 font-medium">
                                            {item.product_name} <span className="text-zinc-500 text-xs ml-1">({item.spec_name})</span>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.price || 0)}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button size="sm" variant="outline" onClick={() => addToCart(item)}>
                                                담기
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {inventory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-40 text-center text-zinc-400">
                                            검색 결과가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="border-blue-100 bg-blue-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-600 flex items-center gap-2">
                            <User className="h-4 w-4" /> 구매자 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <div className="flex flex-col gap-1 mb-2">
                            <div className="text-zinc-500 text-xs">구매자 정보</div>
                            <div className="font-bold text-base bg-blue-100/50 p-2 rounded border border-blue-200">
                                {selectedUser.military_number} / {getRankLabel(selectedUser.rank)} / {selectedUser.name}
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-zinc-600">가용 포인트</span>
                            <span className="font-bold text-blue-700">{formatCurrency(availablePoints)}</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3 h-8 text-xs border-blue-200" onClick={() => setStep(1)}>구매자 재검색</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" /> 장바구니
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3 max-h-[400px] overflow-auto pr-1">
                            {cart.length === 0 && <div className="text-center py-12 text-zinc-400 text-sm">담긴 품목이 없습니다.</div>}
                            {cart.map((item) => (
                                <div key={item.id} className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-zinc-900">{item.product_name}</div>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-400 hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-xs text-zinc-500">{item.spec_name}</div>
                                    <div className="flex justify-between items-center pt-1">
                                        <div className="flex items-center border rounded bg-white">
                                            <button
                                                className="px-2 py-1 text-zinc-500 hover:bg-zinc-50 disabled:opacity-30"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="px-2 py-1 w-8 text-center text-xs font-bold border-x">{item.quantity}</span>
                                            <button
                                                className="px-2 py-1 text-zinc-500 hover:bg-zinc-50"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="font-bold text-blue-600">{formatCurrency(item.unitPrice * item.quantity)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t space-y-2">
                            <div className="flex justify-between font-bold text-lg">
                                <span>합계</span>
                                <span className="text-blue-600 font-mono">{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 text-xs font-medium",
                                totalAmount > availablePoints ? "text-red-500" : "text-green-600"
                            )}>
                                {totalAmount > availablePoints ? (
                                    <><AlertCircle className="h-3.5 w-3.5" /> 포인트가 부족합니다.</>
                                ) : (
                                    <><CheckCircle2 className="h-3.5 w-3.5" /> 결제 가능합니다.</>
                                )}
                            </div>
                            <Button
                                className="w-full bg-[#1d4ed8]"
                                onClick={handleSubmit}
                                disabled={cart.length === 0 || totalAmount > availablePoints || loading}
                            >
                                {loading ? "처리중..." : "판매 확정"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
