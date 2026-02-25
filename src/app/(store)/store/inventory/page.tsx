import { getInventory } from "@/actions/inventory";
import { getCategories } from "@/actions/products";
import { InventoryManager } from "@/components/inventory/InventoryManager";

export const dynamic = 'force-dynamic';

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string }>;
}) {
    const params = await searchParams;
    const storeId = "00000000-0000-0000-0000-000000000001"; // Mock for now

    const [inventoryResult, categoriesResult] = await Promise.all([
        getInventory(storeId, {
            search: params.search,
            categoryId: params.category,
        }),
        getCategories(),
    ]);

    const inventory = Array.isArray(inventoryResult?.data) ? inventoryResult.data : [];
    const categories = Array.isArray(categoriesResult?.data) ? categoriesResult.data : [];

    return (
        <InventoryManager
            initialInventory={inventory}
            categories={categories}
        />
    );
}
