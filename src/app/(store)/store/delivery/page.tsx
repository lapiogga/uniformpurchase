import { getDeliveryZones } from "@/actions/delivery";
import { DeliveryZoneManager } from "@/components/delivery/DeliveryZoneManager";

export const dynamic = 'force-dynamic';

export default async function DeliveryPage() {
    const storeId = "00000000-0000-0000-0000-000000000001"; // Mock

    const zonesRes = await getDeliveryZones(storeId);
    const zones = zonesRes.success ? (zonesRes.data || []) : [];

    return (
        <DeliveryZoneManager
            storeId={storeId}
            initialZones={zones}
        />
    );
}
