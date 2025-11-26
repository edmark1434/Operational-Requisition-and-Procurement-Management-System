import serviceData from '@/pages/datasets/service';
import categoriesData from '@/pages/datasets/category';
import suppliersData from '@/pages/datasets/supplier';

export const transformServicesData = () => {
    return serviceData.map(service => {
        const category = categoriesData.find(cat => cat.CAT_ID === service.CATEGORY_ID);
        const vendor = suppliersData.find(s => s.ID === service.VENDOR_ID);

        return {
            ID: service.ID,
            NAME: service.NAME,
            DESCRIPTION: service.DESCRIPTION,
            HOURLY_RATE: service.HOURLY_RATE,
            VENDOR_ID: service.VENDOR_ID,
            VENDOR_NAME: vendor?.NAME || 'Unknown Vendor',
            VENDOR_EMAIL: vendor?.EMAIL || '',
            VENDOR_CONTACT_NUMBER: vendor?.CONTACT_NUMBER || '',
            CATEGORY_ID: service.CATEGORY_ID,
            CATEGORY: category?.NAME || 'Uncategorized',
            IS_ACTIVE: service.IS_ACTIVE,
            STATUS: service.IS_ACTIVE ? 'active' : 'inactive',
            CREATED_AT: new Date().toISOString(),
            UPDATED_AT: new Date().toISOString()
        };
    });
};
