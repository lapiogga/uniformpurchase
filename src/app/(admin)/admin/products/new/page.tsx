import { ProductForm } from "@/components/forms/ProductForm";

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">품목 신규 등록</h2>
                <p className="text-sm text-zinc-500">배정될 품목의 기본 정보를 등록합니다.</p>
            </div>
            <ProductForm />
        </div>
    );
}
