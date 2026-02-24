import { TailorForm } from "@/components/forms/TailorForm";

export default function NewTailorPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">체척업체 신규 등록</h2>
                <p className="text-sm text-zinc-500">시스템과 연동할 새로운 체척업체를 추가합니다.</p>
            </div>
            <TailorForm />
        </div>
    );
}
