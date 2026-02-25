'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { upsertDeliveryZone, deleteDeliveryZone } from "@/actions/delivery";

export function DeliveryZoneManager({
    storeId,
    initialZones
}: {
    storeId: string;
    initialZones: any[]
}) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Form states
    const [zoneName, setZoneName] = useState('');
    const [address, setAddress] = useState('');
    const [note, setNote] = useState('');

    const handleSave = async (id?: string) => {
        if (!zoneName || !address) {
            toast.error("배송지명과 주소를 입력하세요.");
            return;
        }

        setLoading(true);
        const res = await upsertDeliveryZone({
            id,
            storeId,
            zoneName,
            address,
            note
        });

        if (res.success) {
            toast.success(id ? "수정되었습니다." : "등록되었습니다.");
            setEditingId(null);
            clearForm();
            router.refresh();
        } else {
            toast.error(res.error || "저장 실패");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("이 배송지를 삭제하시겠습니까?")) return;
        const res = await deleteDeliveryZone(id);
        if (res.success) {
            toast.success("삭제되었습니다.");
            router.refresh();
        }
    };

    const startEdit = (zone: any) => {
        setEditingId(zone.id);
        setZoneName(zone.zone_name);
        setAddress(zone.address || '');
        setNote(zone.note || '');
    };

    const clearForm = () => {
        setZoneName('');
        setAddress('');
        setNote('');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">직접배송 배송지 관리</h2>
                    <p className="text-sm text-zinc-500">판매소에서 직접 배송을 수행하는 주요 거점(배송지)을 관리합니다.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* 등록/수정 폼 */}
                <Card className="md:col-span-1 border-zinc-200">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {editingId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {editingId ? "배송지 수정" : "신규 배송지 등록"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>배송지명 (예: 1대대 본부)</Label>
                            <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="배송지 이름을 입력하세요" />
                        </div>
                        <div className="space-y-2">
                            <Label>주소 / 위치</Label>
                            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="상세 주소를 입력하세요" />
                        </div>
                        <div className="space-y-2">
                            <Label>비고 (선택)</Label>
                            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="참고 사항" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1 bg-blue-600" onClick={() => handleSave(editingId || undefined)} disabled={loading}>
                                {editingId ? "수정 완료" : "배송지 등록"}
                            </Button>
                            {editingId && (
                                <Button variant="outline" onClick={() => { setEditingId(null); clearForm(); }}>취소</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 목록 */}
                <Card className="md:col-span-2 border-zinc-200">
                    <CardHeader>
                        <CardTitle className="text-lg">배송지 목록</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50">
                                <TableRow>
                                    <TableHead className="pl-6">배송지명</TableHead>
                                    <TableHead>주소</TableHead>
                                    <TableHead className="text-right pr-6">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialZones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-40 text-center text-zinc-400">등록된 배송지가 없습니다.</TableCell>
                                    </TableRow>
                                ) : (
                                    initialZones.map((zone) => (
                                        <TableRow key={zone.id} className={editingId === zone.id ? "bg-blue-50/50" : ""}>
                                            <TableCell className="pl-6 font-bold text-zinc-900">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                                                    {zone.zone_name}
                                                </div>
                                                <div className="text-xs text-zinc-500 font-normal ml-5">{zone.note}</div>
                                            </TableCell>
                                            <TableCell className="text-sm text-zinc-600">{zone.address}</TableCell>
                                            <TableCell className="text-right pr-6 space-x-1">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(zone)}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(zone.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
