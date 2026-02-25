'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { X, Plus, Save, Trash2, GripVertical } from "lucide-react";
import { getProductSpecs, addProductSpec, updateProductSpec, deleteProductSpec } from "@/actions/products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductSpecModal({
    isOpen,
    onClose,
    productId,
    productName
}: {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
}) {
    const [specs, setSpecs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSpecName, setNewSpecName] = useState('');

    useEffect(() => {
        if (isOpen && productId) {
            loadSpecs();
        }
    }, [isOpen, productId]);

    async function loadSpecs() {
        setLoading(true);
        const res = await getProductSpecs(productId);
        if (res.success) {
            setSpecs(res.data || []);
        }
        setLoading(false);
    }

    const handleAddSpec = async () => {
        if (!newSpecName.trim()) return;

        const res = await addProductSpec(productId, newSpecName, specs.length + 1);
        if (res.success) {
            toast.success("규격이 추가되었습니다.");
            setNewSpecName('');
            loadSpecs();
        } else {
            toast.error(res.error);
        }
    };

    const handleUpdateSpec = async (id: string, name: string, order: number) => {
        const res = await updateProductSpec(id, name, order);
        if (res.success) {
            toast.success("수정되었습니다.");
            loadSpecs();
        } else {
            toast.error(res.error);
        }
    };

    const handleDeleteSpec = async (id: string) => {
        if (!confirm("이 규격을 삭제하시겠습니까?")) return;
        const res = await deleteProductSpec(id);
        if (res.success) {
            toast.success("삭제되었습니다.");
            loadSpecs();
        } else {
            toast.error(res.error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-2xl border-none overflow-hidden bg-white">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-zinc-50/50 py-4 px-6">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                            규격 관리
                        </CardTitle>
                        <p className="text-xs text-zinc-500 mt-1">{productName}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-zinc-200" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Add Spec Input */}
                    <div className="flex gap-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <div className="flex-1 space-y-1.5">
                            <Label htmlFor="new-spec" className="text-xs font-bold text-blue-700">신규 규격 추가</Label>
                            <Input
                                id="new-spec"
                                placeholder="예: 95(L), 32-인치 등"
                                value={newSpecName}
                                onChange={(e) => setNewSpecName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSpec()}
                                className="bg-white border-blue-200"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleAddSpec} className="bg-blue-600 hover:bg-blue-700 font-bold h-10 px-4">
                                <Plus className="h-4 w-4 mr-1" /> 추가
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <Label className="text-sm font-bold text-zinc-700">등록된 규격 목록</Label>
                        {loading ? (
                            <div className="text-center py-10 text-zinc-400">로딩 중...</div>
                        ) : specs.length === 0 ? (
                            <div className="text-center py-10 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 text-sm">
                                등록된 규격이 없습니다.
                            </div>
                        ) : (
                            specs.map((spec, index) => (
                                <div key={spec.id} className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg group hover:border-blue-300 hover:shadow-sm transition-all">
                                    <div className="text-zinc-300 group-hover:text-blue-400 transition-colors">
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="text-xs font-mono text-zinc-400 w-6">{index + 1}</div>
                                    <Input
                                        defaultValue={spec.spec_name}
                                        onBlur={(e) => e.target.value !== spec.spec_name && handleUpdateSpec(spec.id, e.target.value, spec.sort_order)}
                                        className="h-8 text-sm focus-visible:ring-blue-500 border-none bg-transparent hover:bg-zinc-50 focus:bg-white"
                                    />
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDeleteSpec(spec.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>

                <CardFooter className="border-t bg-zinc-50/50 py-4 px-6 justify-end">
                    <Button onClick={onClose} variant="secondary" className="font-bold">닫기</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
