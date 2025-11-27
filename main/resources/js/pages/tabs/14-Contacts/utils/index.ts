import contactData from '@/pages/datasets/contact';
import vendorData from '@/pages/datasets/supplier';

export const transformContactsData = () => {
    return contactData.map(contact => {
        const vendor = vendorData.find(v => v.ID === contact.VENDOR_ID);

        return {
            ID: contact.ID,
            NAME: contact.NAME,
            POSITION: contact.POSITION,
            EMAIL: contact.EMAIL,
            CONTACT_NUMBER: contact.CONTACT_NUMBER,
            CONTACT_INFO: contact.CONTACT_INFO,
            VENDOR_ID: contact.VENDOR_ID,
            VENDOR_NAME: vendor?.NAME || 'Unknown Vendor',
            VENDOR_EMAIL: vendor?.EMAIL || '',
            IS_ACTIVE: contact.IS_ACTIVE,
            STATUS: contact.IS_ACTIVE ? 'active' : 'inactive',
            CREATED_AT: contact.CREATED_AT,
            UPDATED_AT: contact.UPDATED_AT
        };
    });
};
