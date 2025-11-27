import deliveriesData from '@/pages/datasets/delivery';
import { purchaseOrdersData } from '@/pages/datasets/purchase_order';
import suppliersData from '@/pages/datasets/supplier';
import itemsData from '@/pages/datasets/items';

export const transformDeliveriesData = () => {
    return deliveriesData.map(delivery => {
        const purchaseOrder = purchaseOrdersData.find(po => po.ID === delivery.PO_ID);
        const supplier = suppliersData.find(s => s.ID === purchaseOrder?.SUPPLIER_ID);

        // Calculate total items and value from ITEMS (not DELIVERY_ITEMS)
        const totalItems = delivery.ITEMS.reduce((sum: number, item: any) => sum + item.QUANTITY, 0);
        const totalValue = delivery.ITEMS.reduce((sum: number, item: any) => sum + (item.QUANTITY * item.UNIT_PRICE), 0);

        return {
            ID: delivery.ID,
            RECEIPT_NO: delivery.RECEIPT_NO,
            DELIVERY_DATE: delivery.DELIVERY_DATE,
            TOTAL_COST: delivery.TOTAL_COST,
            STATUS: delivery.STATUS,
            REMARKS: delivery.REMARKS || '',
            RECEIPT_PHOTO: delivery.RECEIPT_PHOTO || '',
            PO_ID: delivery.PO_ID,
            PO_REFERENCE: purchaseOrder?.REFERENCE_NO || 'Unknown PO',
            SUPPLIER_ID: purchaseOrder?.SUPPLIER_ID,
            SUPPLIER_NAME: purchaseOrder?.SUPPLIER_NAME || supplier?.NAME || 'Unknown Supplier',
            TOTAL_ITEMS: totalItems,
            TOTAL_VALUE: totalValue,
            // Keep as ITEMS to match your mock data structure
            ITEMS: delivery.ITEMS.map((item: any) => ({
                ID: item.ID,
                ITEM_ID: item.ITEM_ID,
                ITEM_NAME: item.NAME,
                QUANTITY: item.QUANTITY,
                UNIT_PRICE: item.UNIT_PRICE,
                BARCODE: item.BARCODE,
                CATEGORY: item.CATEGORY
            }))
        };
    });
};

export const getAvailablePurchaseOrders = () => {
    return purchaseOrdersData.filter(po =>
        po.STATUS === 'approved' || po.STATUS === 'completed'
    ).map(po => {
        const supplier = suppliersData.find(s => s.ID === po.SUPPLIER_ID);
        return {
            ID: po.ID,
            REFERENCE_NO: po.REFERENCE_NO,
            SUPPLIER_ID: po.SUPPLIER_ID,
            SUPPLIER_NAME: supplier?.NAME || po.SUPPLIER_NAME,
            TOTAL_COST: po.TOTAL_COST,
            CREATED_AT: po.CREATED_AT,
            PAYMENT_TYPE: po.PAYMENT_TYPE,
            STATUS: po.STATUS,
            REMARKS: po.REMARKS,
            ORDER_TYPE: po.ORDER_TYPE,
            ITEMS: po.ITEMS || [],
            SERVICES: po.SERVICES || []
        };
    });
};

export const getPurchaseOrderItems = (poId: number) => {
    const purchaseOrder = purchaseOrdersData.find(po => po.ID === poId);
    if (!purchaseOrder) return [];

    return purchaseOrder.ITEMS.map(item => {
        // Use ITEM_ID to find the item in itemsData
        const itemData = itemsData.find(i => i.ITEM_ID === item.ITEM_ID);
        return {
            ID: item.ID,
            ITEM_ID: item.ITEM_ID,
            ITEM_NAME: itemData?.NAME || item.NAME || 'Unknown Item',
            QUANTITY_ORDERED: item.QUANTITY,
            UNIT_PRICE: item.UNIT_PRICE,
            BARCODE: itemData?.BARCODE || '',
            CATEGORY: itemData?.CATEGORY_ID || 0
        };
    });
};

// Remove or comment out getAvailableSuppliers since it's not used
// export const getAvailableSuppliers = () => {
//     return suppliersData.map(supplier => ({
//         ID: supplier.ID,
//         NAME: supplier.NAME,
//         CONTACT_NUMBER: supplier.CONTACT_NUMBER,
//         CONTACT_INFO: supplier.CONTACT_INFO,
//         EMAIL: supplier.EMAIL,
//         ALLOWS_CASH: supplier.ALLOWS_CASH,
//         ALLOWS_DISBURSEMENT: supplier.ALLOWS_DISBURSEMENT
//     }));
// };

// Re-export utilities
export { formatDate, formatDateTime, formatCurrency } from './formatters';
export { DeliveriesIcons } from './icons';
export { getDeliveriesStatusColor } from './styleUtils';
