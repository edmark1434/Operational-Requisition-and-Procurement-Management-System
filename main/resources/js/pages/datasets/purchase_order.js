export const purchaseOrdersData = [
    {
        ID: 1,
        REFERENCE_NO: 'PO-2024-001',
        CREATED_AT: '2024-01-15',
        TOTAL_COST: 15000,
        PAYMENT_TYPE: 'cash',
        STATUS: 'pending_approval',
        SUPPLIER_ID: 1,
        SUPPLIER_NAME: 'Electrical Supplies Co.',
        REQUISITION_ID: 5001,
        REMARKS: 'Urgent order for maintenance department',
        ITEMS: [
            {
                ID: 7001,
                ITEM_ID: 1004,
                NAME: 'Power Drill Machine',
                QUANTITY: 5,
                UNIT_PRICE: 350.00,
                CATEGORY_ID: 3,
                SELECTED: true
            },
            {
                ID: 7002,
                ITEM_ID: 1002,
                NAME: 'Electrical Wire 2.5mm',
                QUANTITY: 2,
                UNIT_PRICE: 120.75,
                CATEGORY_ID: 1,
                SELECTED: true
            }
        ]
    },
    {
        ID: 2,
        REFERENCE_NO: 'PO-2024-002',
        CREATED_AT: '2024-01-10',
        TOTAL_COST: 152.50,
        PAYMENT_TYPE: 'disbursement',
        STATUS: 'approved',
        SUPPLIER_ID: 3,
        SUPPLIER_NAME: 'Office World Suppliers',
        REQUISITION_ID: 5003,
        REMARKS: 'Standard office supplies order',
        ITEMS: [
            {
                ID: 7003,
                ITEM_ID: 1003,
                NAME: 'Printer Paper A4',
                QUANTITY: 10,
                UNIT_PRICE: 15.25,
                CATEGORY_ID: 6,
                SELECTED: true
            }
        ]
    },
    {
        ID: 3,
        REFERENCE_NO: 'PO-2024-003',
        CREATED_AT: '2024-01-05',
        TOTAL_COST: 350.00,
        PAYMENT_TYPE: 'store_credit',
        STATUS: 'pending_approval',
        SUPPLIER_ID: 2,
        SUPPLIER_NAME: 'Tool Distributors Ltd.',
        REQUISITION_ID: 5003,
        REMARKS: 'Equipment for new project',
        ITEMS: [
            {
                ID: 7004,
                ITEM_ID: 1004,
                NAME: 'Power Drill Machine',
                QUANTITY: 1,
                UNIT_PRICE: 350.00,
                CATEGORY_ID: 3,
                SELECTED: true
            }
        ]
    }
];
