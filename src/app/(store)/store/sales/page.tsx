import { getSalesHistory } from "@/actions/orders";
import { SalesHistoryList } from "@/components/sales/SalesHistoryList";

export const dynamic = 'force-dynamic';

export default async function StoreSalesPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const params = await searchParams;
    const storeId = "00000000-0000-0000-0000-000000000001"; // Mock

    const historyRes = await getSalesHistory(storeId, { search: params.search });
    const orders = (historyRes.success && Array.isArray(historyRes.data)) ? historyRes.data : [];

    return (
        <SalesHistoryList initialOrders={orders} />
    );
}
