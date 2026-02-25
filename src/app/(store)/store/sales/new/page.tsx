import { OfflineSalesForm } from "@/components/forms/OfflineSalesForm";

export default async function NewOfflineSalePage() {
    const storeId = "00000000-0000-0000-0000-000000000001"; // Mock

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">오프라인 판매 등록</h2>
                <p className="text-sm text-zinc-500">매장 방문 구매자의 포인트를 사용하여 판매를 등록합니다.</p>
            </div>

            <OfflineSalesForm storeId={storeId} />
        </div>
    );
}
