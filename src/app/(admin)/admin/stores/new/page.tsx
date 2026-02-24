import { StoreForm } from "@/components/forms/StoreForm";

export default function NewStorePage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">판매소 신규 등록</h2>
                <p className="text-sm text-zinc-500">부대 내 새로운 판매 거점을 등록합니다.</p>
            </div>
            <StoreForm />
        </div>
    );
}
