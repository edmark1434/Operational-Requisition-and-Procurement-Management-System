// purchase_order.js
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
        ORDER_TYPE: 'items',
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
        ],
        SERVICES: []
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
        REQUISITION_ID: 5002,
        ORDER_TYPE: 'items',
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
        ],
        SERVICES: []
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
        ORDER_TYPE: 'items',
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
        ],
        SERVICES: []
    },
    {
        ID: 4,
        REFERENCE_NO: 'PO-2024-004',
        CREATED_AT: '2024-01-28',
        TOTAL_COST: 189.99,
        PAYMENT_TYPE: 'cash',
        STATUS: 'completed',
        SUPPLIER_ID: 3,
        SUPPLIER_NAME: 'Office World Suppliers',
        REQUISITION_ID: 5004,
        ORDER_TYPE: 'items',
        REMARKS: 'New office furniture',
        ITEMS: [
            {
                ID: 7005,
                ITEM_ID: 1008,
                NAME: 'Office Chair Ergonomic',
                QUANTITY: 1,
                UNIT_PRICE: 189.99,
                CATEGORY_ID: 6,
                SELECTED: true
            }
        ],
        SERVICES: []
    },
    // New Service Purchase Orders
    {
        ID: 5,
        REFERENCE_NO: 'PO-2024-005',
        CREATED_AT: '2024-01-19',
        TOTAL_COST: 920.00,
        PAYMENT_TYPE: 'disbursement',
        STATUS: 'pending_approval',
        SUPPLIER_ID: 3,
        SUPPLIER_NAME: 'Tech Solutions Inc.',
        REQUISITION_ID: 5004,
        ORDER_TYPE: 'services',
        REMARKS: 'IT support for new office setup',
        ITEMS: [],
        SERVICES: [
            {
                ID: 1,
                SERVICE_ID: 1,
                NAME: 'IT Support',
                DESCRIPTION: 'Technical support and IT services',
                QUANTITY: 8,
                UNIT_PRICE: 75.00,
                SELECTED: true
            },
            {
                ID: 2,
                SERVICE_ID: 7,
                NAME: 'Network Installation',
                DESCRIPTION: 'Network cabling and setup',
                QUANTITY: 4,
                UNIT_PRICE: 80.00,
                SELECTED: true
            }
        ]
    },
    {
        ID: 6,
        REFERENCE_NO: 'PO-2024-006',
        CREATED_AT: '2024-01-21',
        TOTAL_COST: 450.00,
        PAYMENT_TYPE: 'cash',
        STATUS: 'approved',
        SUPPLIER_ID: 6,
        SUPPLIER_NAME: 'CleanPro Services',
        REQUISITION_ID: 5006,
        ORDER_TYPE: 'services',
        REMARKS: 'Post-renovation deep cleaning',
        ITEMS: [],
        SERVICES: [
            {
                ID: 4,
                SERVICE_ID: 4,
                NAME: 'Cleaning Services',
                DESCRIPTION: 'Office and facility cleaning',
                QUANTITY: 10,
                UNIT_PRICE: 45.00,
                SELECTED: true
            }
        ]
    },
    {
        ID: 7,
        REFERENCE_NO: 'PO-2024-007',
        CREATED_AT: '2024-01-23',
        TOTAL_COST: 270.00,
        PAYMENT_TYPE: 'disbursement',
        STATUS: 'completed',
        SUPPLIER_ID: 9,
        SUPPLIER_NAME: 'Climate Control Experts',
        REQUISITION_ID: 5008,
        ORDER_TYPE: 'services',
        REMARKS: 'Seasonal HVAC maintenance',
        ITEMS: [],
        SERVICES: [
            {
                ID: 7,
                SERVICE_ID: 8,
                NAME: 'HVAC Maintenance',
                DESCRIPTION: 'Heating and cooling system maintenance',
                QUANTITY: 3,
                UNIT_PRICE: 90.00,
                SELECTED: true
            }
        ]
    },
    {
        ID: 8,
        REFERENCE_NO: 'PO-2024-008',
        CREATED_AT: '2024-01-25',
        TOTAL_COST: 740.00,
        PAYMENT_TYPE: 'cash',
        STATUS: 'pending_approval',
        SUPPLIER_ID: 4,
        SUPPLIER_NAME: 'PowerTech Electrical',
        REQUISITION_ID: 5002,
        ORDER_TYPE: 'items',
        REMARKS: 'Additional electrical supplies for urgent project',
        ITEMS: [
            {
                ID: 7006,
                ITEM_ID: 1005,
                NAME: 'LED Light Bulbs 10W',
                QUANTITY: 20,
                UNIT_PRICE: 8.99,
                CATEGORY_ID: 1,
                SELECTED: true
            },
            {
                ID: 7007,
                ITEM_ID: 1009,
                NAME: 'Circuit Breaker 20A',
                QUANTITY: 15,
                UNIT_PRICE: 18.75,
                CATEGORY_ID: 1,
                SELECTED: true
            },
            {
                ID: 7008,
                ITEM_ID: 1010,
                NAME: 'Industrial Extension Cord',
                QUANTITY: 8,
                UNIT_PRICE: 32.40,
                CATEGORY_ID: 1,
                SELECTED: true
            }
        ],
        SERVICES: []
    },
    {
        ID: 9,
        REFERENCE_NO: 'PO-2024-009',
        CREATED_AT: '2024-01-26',
        TOTAL_COST: 350.00,
        PAYMENT_TYPE: 'store_credit',
        STATUS: 'approved',
        SUPPLIER_ID: 5,
        SUPPLIER_NAME: 'PipeMasters Plumbing',
        REQUISITION_ID: 5010,
        ORDER_TYPE: 'services',
        REMARKS: 'Urgent plumbing repair in break room',
        ITEMS: [],
        SERVICES: [
            {
                ID: 10,
                SERVICE_ID: 3,
                NAME: 'Plumbing Services',
                DESCRIPTION: 'Pipe installation and plumbing repairs',
                QUANTITY: 5,
                UNIT_PRICE: 70.00,
                SELECTED: true
            }
        ]
    },
    {
        ID: 10,
        REFERENCE_NO: 'PO-2024-010',
        CREATED_AT: '2024-01-27',
        TOTAL_COST: 1285.00,
        PAYMENT_TYPE: 'disbursement',
        STATUS: 'pending_approval',
        SUPPLIER_ID: 2,
        SUPPLIER_NAME: 'Tool Distributors Ltd.',
        REQUISITION_ID: 5009,
        ORDER_TYPE: 'items',
        REMARKS: 'Tools for maintenance team expansion',
        ITEMS: [
            {
                ID: 7009,
                ITEM_ID: 1001,
                NAME: 'Phillips Screwdriver Set',
                QUANTITY: 10,
                UNIT_PRICE: 25.50,
                CATEGORY_ID: 3,
                SELECTED: true
            },
            {
                ID: 7010,
                ITEM_ID: 1006,
                NAME: 'Industrial Safety Gloves',
                QUANTITY: 25,
                UNIT_PRICE: 12.50,
                CATEGORY_ID: 2,
                SELECTED: true
            },
            {
                ID: 7011,
                ITEM_ID: 1007,
                NAME: 'Hammer Drill Bits Set',
                QUANTITY: 5,
                UNIT_PRICE: 45.00,
                CATEGORY_ID: 3,
                SELECTED: true
            },
            {
                ID: 7012,
                ITEM_ID: 1011,
                NAME: 'Metal File Set',
                QUANTITY: 8,
                UNIT_PRICE: 28.90,
                CATEGORY_ID: 3,
                SELECTED: true
            },
            {
                ID: 7013,
                ITEM_ID: 1014,
                NAME: 'Measuring Tape 8m',
                QUANTITY: 12,
                UNIT_PRICE: 15.80,
                CATEGORY_ID: 3,
                SELECTED: true
            }
        ],
        SERVICES: []
    }
];
