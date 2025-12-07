import returnsData from '@/pages/datasets/returns';
import returnItemsData from '@/pages/datasets/return_items';
import deliveriesData from '@/pages/datasets/delivery';
import suppliersData from '@/pages/datasets/supplier';
import itemsData from '@/pages/datasets/items';
import { it } from 'node:test';

export const transformReturnsData = (  returnsData: any[] = [],
    returnItemsData: any[] = [],
    deliveriesData: any[] = [],
    suppliersData: any[] = [],
    itemsData: any[] = []
) => {
    return returnsData.map(returnItem => {
        const returnItems = returnItemsData.filter(item => item.RETURN_ID === returnItem.ID);
        const delivery = deliveriesData.find(d => d.ID === returnItem.DELIVERY_ID);
        const supplier = suppliersData.find(s => s.NAME === returnItem.SUPPLIER_NAME);
        // Calculate total items and value
        const itemsWithDetails = returnItems.map(ri => {
            const item = itemsData.find(i => i.ID === ri.ITEM_ID);
            const deliveryItem = delivery?.ITEMS.find((d: any) => d.ITEM_ID === ri.ITEM_ID);
            console.log('Item',returnItem);
            return {
                ID: ri.ID,
                ITEM_ID: ri.ITEM_ID,
                ITEM_NAME: item?.NAME || 'Unknown Item',
                QUANTITY: ri.QUANTITY,
                UNIT_PRICE: item?.UNIT_PRICE || deliveryItem?.UNIT_PRICE || 0,
                REASON: ri.REASON,
                ORIGINAL_QUANTITY: deliveryItem?.QUANTITY || ri.QUANTITY
            };
        });

        const totalItems = returnItems.reduce((sum, item) => sum + item.QUANTITY, 0);
        const totalValue = itemsWithDetails.reduce((sum, item) => sum + (item.QUANTITY * item.UNIT_PRICE), 0);

        return {
            ID: returnItem.ID,
            REFERENCE_NO: `RET-${returnItem.ID.toString().padStart(3, '0')}`,
            DELIVERY_ID: returnItem.DELIVERY_ID,
            DELIVERY_REFERENCE: delivery?.RECEIPT_NO || 'Unknown',
            SUPPLIER_ID: supplier?.ID || 0,
            SUPPLIER_NAME: returnItem.SUPPLIER_NAME,
            CREATED_AT: returnItem.CREATED_AT,
            RETURN_DATE: returnItem.RETURN_DATE,
            STATUS: returnItem.STATUS,
            REMARKS: returnItem.REMARKS || '',
            TOTAL_ITEMS: totalItems,
            TOTAL_VALUE: totalValue,
            ITEMS: itemsWithDetails
        };
    });
};

export const getAvailableDeliveries = () => {
    return deliveriesData.map(delivery => {
        const supplier = suppliersData.find(s => s.ID === delivery.SUPPLIER_ID);
        return {
            ID: delivery.ID,
            REFERENCE_NO: delivery.RECEIPT_NO,
            SUPPLIER_ID: delivery.SUPPLIER_ID,
            SUPPLIER_NAME: supplier?.NAME || 'Unknown Supplier',
            DELIVERY_DATE: delivery.DELIVERY_DATE,
            ITEMS: delivery.ITEMS || []
        };
    });
};

export const getDeliveryItems = (deliveryId: number) => {
    const delivery = deliveriesData.find(d => d.ID === deliveryId);
    if (!delivery) return [];

    return delivery.ITEMS.map(item => ({
        ID: item.ID,
        ITEM_ID: item.ITEM_ID,
        ITEM_NAME: item.NAME,
        QUANTITY_DELIVERED: item.QUANTITY,
        UNIT_PRICE: item.UNIT_PRICE,
        AVAILABLE_QUANTITY: item.QUANTITY,
        BARCODE: item.BARCODE,
        CATEGORY: item.CATEGORY
    }));
};

// Export formatters and other utilities
export { formatDate, formatDateTime, formatCurrency } from './formatters';
export { ReturnsIcons } from './icons';
export { getReturnsStatusColor } from './styleUtils';
