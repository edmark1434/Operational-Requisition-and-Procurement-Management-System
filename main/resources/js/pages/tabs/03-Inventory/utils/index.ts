import itemsData from '@/pages/datasets/items';
import categoriesData from '@/pages/datasets/category';
import makesData from '@/pages/datasets/make';
import suppliersData from '@/pages/datasets/supplier';

export const transformInventoryData = () => {
    return itemsData.map(item => {
        const category = categoriesData.find(cat => cat.CAT_ID === item.CATEGORY_ID);
        const make = makesData.find(m => m.ID === item.MAKE_ID);
        const supplier = suppliersData.find(s => s.ID === item.SUPPLIER_ID);

        return {
            ID: item.ITEM_ID,
            BARCODE: item.BARCODE,
            NAME: item.NAME,
            DIMENSIONS: item.DIMENSIONS,
            UNIT_PRICE: item.UNIT_PRICE,
            CURRENT_STOCK: item.CURRENT_STOCK,
            MAKE_ID: item.MAKE_ID,
            MAKE_NAME: make?.NAME || 'Unknown',
            CATEGORY_ID: item.CATEGORY_ID,
            CATEGORY: category?.NAME || 'Uncategorized',
            SUPPLIER_ID: item.SUPPLIER_ID,
            SUPPLIER_NAME: supplier?.NAME || 'Unknown Supplier',
            SUPPLIER_EMAIL: supplier?.EMAIL || '',
            SUPPLIER_CONTACT_NUMBER: supplier?.CONTACT_NUMBER || '',
            ALLOWS_CASH: supplier?.ALLOWS_CASH || false,
            ALLOWS_DISBURSEMENT: supplier?.ALLOWS_DISBURSEMENT || false,
            ALLOWS_STORE_CREDIT: supplier?.ALLOWS_STORE_CREDIT || false,
            CREATED_AT: new Date().toISOString(),
            UPDATED_AT: new Date().toISOString()
        };
    });
};
