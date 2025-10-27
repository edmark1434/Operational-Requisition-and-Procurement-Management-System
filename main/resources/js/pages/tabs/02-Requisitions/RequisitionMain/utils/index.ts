// Import your actual datasets
import requisitionsData from '@/pages/datasets/requisition';
import requisitionItemsData from '@/pages/datasets/requisition_item';
import itemsData from '@/pages/datasets/items';
import categoriesData from '@/pages/datasets/category';
import usersData from '@/pages/datasets/user';

export const transformRequisitionData = () => {
    return requisitionsData.map(requisition => {
        const requisitionItems = requisitionItemsData.filter(item => item.REQ_ID === requisition.REQ_ID);
        const requestorUser = usersData.find(user => user.US_ID === requisition.US_ID);

        const itemsWithDetails = requisitionItems.map(reqItem => {
            const itemDetails = itemsData.find(item => item.ITEM_ID === reqItem.ITEM_ID);
            const category = categoriesData.find(cat => cat.CAT_ID === itemDetails?.CATEGORY_ID);
            return {
                NAME: itemDetails?.NAME || 'Unknown Item',
                DESCRIPTION: reqItem.DESCRIPTION || '', // Use DESCRIPTION from requisitionItemsData
                QUANTITY: reqItem.QUANTITY,
                CATEGORY: category?.NAME || reqItem.CATEGORY,
                CATEGORY_ID: category?.CAT_ID
            };
        });

        // Get all unique categories from items
        const categories = [...new Set(itemsWithDetails.map(item => item.CATEGORY))];

        return {
            ID: requisition.REQ_ID,
            CREATED_AT: requisition.DATE_REQUESTED,
            UPDATED_AT: requisition.DATE_UPDATED,
            STATUS: requisition.STATUS,
            REMARKS: requisition.REASON || '',
            USER_ID: requisition.US_ID,
            REQUESTOR: requisition.REQUESTOR,
            PRIORITY: requisition.PRIORITY,
            NOTES: requisition.NOTES,
            ITEMS: itemsWithDetails,
            CATEGORIES: categories,
            // REMOVED TOTAL_AMOUNT
        };
    });
};
