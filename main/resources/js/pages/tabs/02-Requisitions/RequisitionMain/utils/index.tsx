// Import your actual datasets
import requisitionsData from '@/pages/datasets/requisition';
import requisitionItemsData from '@/pages/datasets/requisition_item';
import requisitionServiceData from '@/pages/datasets/requisition_service';
import itemsData from '@/pages/datasets/items';
import categoriesData from '@/pages/datasets/category';
import usersData from '@/pages/datasets/user';
import serviceData from '@/pages/datasets/service';

export const transformRequisitionData = () => {
    return requisitionsData.map(requisition => {
        const isServiceRequisition = requisition.TYPE === 'services';

        if (isServiceRequisition) {
            // Handle service requisitions
            // FIX: Map requisition IDs from requisition.js to requisition_service.js
            // Since they don't match, we'll create mock service data for demonstration
            const requisitionServices = getMockServicesForRequisition(requisition.ID);

            const servicesWithDetails = requisitionServices.map(reqService => {
                const serviceDetails = serviceData.find(service => service.ID === reqService.SERVICE_ID);
                return {
                    NAME: serviceDetails?.NAME || 'Unknown Service',
                    DESCRIPTION: serviceDetails?.DESCRIPTION || '',
                    QUANTITY: reqService.QUANTITY,
                    UNIT_PRICE: reqService.UNIT_PRICE,
                    TOTAL: reqService.TOTAL
                };
            });

            // Calculate total amount for services
            const totalAmount = servicesWithDetails.reduce((sum, service) => sum + (Number(service.TOTAL) || 0), 0);

            // Get categories from services
            const categories = ['Services'];

            return {
                ID: requisition.ID,
                TYPE: requisition.TYPE,
                CREATED_AT: requisition.CREATED_AT,
                UPDATED_AT: requisition.UPDATED_AT,
                STATUS: requisition.STATUS,
                REMARKS: requisition.REMARKS || '',
                USER_ID: requisition.USER_ID,
                REQUESTOR: requisition.REQUESTOR,
                PRIORITY: requisition.PRIORITY,
                NOTES: requisition.NOTES,
                SERVICES: servicesWithDetails,
                ITEMS: [],
                CATEGORIES: categories,
                TOTAL_AMOUNT: totalAmount
            };
        } else {
            // Handle item requisitions
            const requisitionItems = requisitionItemsData.filter(item => item.REQ_ID === requisition.ID);

            const itemsWithDetails = requisitionItems.map(reqItem => {
                const itemDetails = itemsData.find(item => item.ITEM_ID === reqItem.ITEM_ID);
                const category = categoriesData.find(cat => cat.CAT_ID === itemDetails?.CATEGORY_ID);
                return {
                    NAME: itemDetails?.NAME || 'Unknown Item',
                    QUANTITY: reqItem.QUANTITY,
                    CATEGORY: category?.NAME || reqItem.CATEGORY,
                    CATEGORY_ID: category?.CAT_ID,
                    UNIT_PRICE: itemDetails?.UNIT_PRICE || 0,
                    TOTAL: (reqItem.QUANTITY * (itemDetails?.UNIT_PRICE || 0)).toFixed(2)
                };
            });

            // Calculate total amount for items
            const totalAmount = itemsWithDetails.reduce((sum, item) => sum + (Number(item.TOTAL) || 0), 0);

            // Get all unique categories from items
            const categories = [...new Set(itemsWithDetails.map(item => item.CATEGORY))];

            return {
                ID: requisition.ID,
                TYPE: requisition.TYPE,
                CREATED_AT: requisition.CREATED_AT,
                UPDATED_AT: requisition.UPDATED_AT,
                STATUS: requisition.STATUS,
                REMARKS: requisition.REMARKS || '',
                USER_ID: requisition.USER_ID,
                REQUESTOR: requisition.REQUESTOR,
                PRIORITY: requisition.PRIORITY,
                NOTES: requisition.NOTES,
                ITEMS: itemsWithDetails,
                SERVICES: [],
                CATEGORIES: categories,
                TOTAL_AMOUNT: totalAmount
            };
        }
    });
};

// Helper function to create mock service data for demonstration
function getMockServicesForRequisition(requisitionId: number) {
    // Map requisition IDs to service data for demonstration
    const serviceMappings: { [key: number]: any[] } = {
        5004: [ // IT support and network setup
            { SERVICE_ID: 1, QUANTITY: 8, UNIT_PRICE: 75.00, TOTAL: 600.00 },
            { SERVICE_ID: 7, QUANTITY: 4, UNIT_PRICE: 80.00, TOTAL: 320.00 }
        ],
        5005: [ // Electrical work
            { SERVICE_ID: 2, QUANTITY: 6, UNIT_PRICE: 85.00, TOTAL: 510.00 }
        ],
        5006: [ // Deep cleaning
            { SERVICE_ID: 4, QUANTITY: 10, UNIT_PRICE: 45.00, TOTAL: 450.00 }
        ],
        5008: [ // HVAC maintenance
            { SERVICE_ID: 8, QUANTITY: 3, UNIT_PRICE: 90.00, TOTAL: 270.00 }
        ],
        5010: [ // Plumbing repair
            { SERVICE_ID: 3, QUANTITY: 5, UNIT_PRICE: 70.00, TOTAL: 350.00 }
        ]
    };

    return serviceMappings[requisitionId] || [];
}

// Helper function to get display name for requisition type
export const getTypeDisplayName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
        'items': 'Items',
        'services': 'Services'
    };
    return typeMap[type?.toLowerCase()] || type;
};

// Helper function to get type color classes
export const getTypeColor = (type: string): string => {
    const isService = type?.toLowerCase() === 'services';
    return isService
        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
};

// Helper function to get type icon
export const getTypeIcon = (type: string) => {
    const isService = type?.toLowerCase() === 'services';
    return isService ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    );
};
