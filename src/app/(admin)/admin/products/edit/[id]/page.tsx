import { getProductById } from "@/actions/products";
import { ProductForm } from "@/components/forms/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const res = await getProductById(id);

    if (!res.success || !res.data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">품목 정보 수정</h2>
                <p className="text-sm text-zinc-500">품목의 기본 정보 및 규격을 관리합니다.</p>
            </div>
            <ProductForm initialData={res.data} isEdit={true} />
        </div>
    );
}
