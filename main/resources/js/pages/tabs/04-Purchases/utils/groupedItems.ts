// Add to PurchaseOrderForm or a utils file
import {Item, RequisitionItem} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";

export interface GroupedItem {
    item_id: number;
    item: Item;
    total_quantity: number;
    unit_price: number;
    reqItems: RequisitionItem[]; // Original reqitem references
    categoryId: number;
}

export const groupRequisitionItems = (reqItems: RequisitionItem[]): GroupedItem[] => {
    const grouped = reqItems.reduce((acc, reqItem) => {
        const key = reqItem.item_id;

        if (!acc[key]) {
            acc[key] = {
                item_id: reqItem.item_id,
                item: reqItem.item,
                total_quantity: 0,
                unit_price: reqItem.item.unit_price,
                reqItems: [],
                categoryId: reqItem.item.category_id,
            };
        }

        acc[key].total_quantity += reqItem.quantity;
        acc[key].reqItems.push(reqItem);

        return acc;
    }, {} as Record<number, GroupedItem>);

    return Object.values(grouped);
};
