// Add to PurchaseOrderForm or a utils file
import {Item, RequisitionItem} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";
import {RequisitionOrderItem} from "@/pages/tabs/04-Purchases/PurchaseOrderEdit";

export interface GroupedItem {
    item_id: number;
    item: Item;
    total_quantity: number;
    unit_price: number;
    reqItems: RequisitionItem[]; // Original reqitem references
    categoryId: number;
    isOrdered: boolean;
}

export const groupRequisitionItems = (
    reqItems: RequisitionItem[],
    requisitionOrderItems: RequisitionOrderItem[] = []
): GroupedItem[] => {
    // Build a quick lookup set of ordered req_item ids
    const orderedReqItemIds = new Set<number>(
        requisitionOrderItems.map(ro => ro.req_item_id)
    );

    const grouped: Record<string, GroupedItem> = {};

    for (const reqItem of reqItems) {
        const isOrdered = orderedReqItemIds.has(reqItem.id);
        const groupKey = `${reqItem.item_id}-${isOrdered ? "ordered" : "not"}`;

        if (!grouped[groupKey]) {
            grouped[groupKey] = {
                item_id: reqItem.item_id,
                item: reqItem.item,
                total_quantity: 0,
                unit_price: reqItem.item.unit_price,
                reqItems: [],
                categoryId: reqItem.item.category_id,
                isOrdered: isOrdered
            };
        }

        grouped[groupKey].total_quantity += reqItem.quantity;
        grouped[groupKey].reqItems.push(reqItem);
    }

    return Object.values(grouped);
};

