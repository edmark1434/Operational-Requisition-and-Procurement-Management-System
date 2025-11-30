// delivery.js
const   deliveries = [
    {
        ID: 1,
        DELIVERY_DATE: '2024-01-20T10:30:00Z',
        TOTAL_COST: 1995.50,
        RECEIPT_NO: 'REC-2024-001',
        RECEIPT_PHOTO: null,
        STATUS: 'received',
        REMARKS: 'All items delivered in good condition',
        PO_ID: 1,
        SUPPLIER_ID: 1,
        SUPPLIER_NAME: 'Electrical Supplies Co.',
        TOTAL_ITEMS: 7,
        TOTAL_VALUE: 1995.50,
        DELIVERY_TYPE: 'Item Purchase',
        ITEMS: [
            {
                ID: 8001,
                ITEM_ID: 1004,
                NAME: 'Power Drill Machine',
                ITEM_NAME: 'Power Drill Machine',
                QUANTITY: 5,
                UNIT_PRICE: 350.00,
                BARCODE: '8806091234570',
                CATEGORY: 'Tools',
                TOTAL_VALUE: 1750.00
            },
            {
                ID: 8002,
                ITEM_ID: 1002,
                NAME: 'Electrical Wire 2.5mm',
                ITEM_NAME: 'Electrical Wire 2.5mm',
                QUANTITY: 2,
                UNIT_PRICE: 120.75,
                BARCODE: '8806091234568',
                CATEGORY: 'Electrical',
                TOTAL_VALUE: 241.50
            }
        ]
    },
    {
        ID: 2,
        DELIVERY_DATE: '2024-01-18T14:15:00Z',
        TOTAL_COST: 152.50,
        RECEIPT_NO: 'REC-2024-002',
        RECEIPT_PHOTO: null,
        STATUS: 'received',
        REMARKS: 'Office supplies delivered',
        PO_ID: 2,
        SUPPLIER_ID: 3,
        SUPPLIER_NAME: 'Office World Suppliers',
        TOTAL_ITEMS: 10,
        TOTAL_VALUE: 152.50,
        DELIVERY_TYPE: 'Item Purchase',
        ITEMS: [
            {
                ID: 8003,
                ITEM_ID: 1003,
                NAME: 'Printer Paper A4',
                ITEM_NAME: 'Printer Paper A4',
                QUANTITY: 10,
                UNIT_PRICE: 15.25,
                BARCODE: '8806091234569',
                CATEGORY: 'Office Supplies',
                TOTAL_VALUE: 152.50
            }
        ]
    },
    {
        ID: 3,
        DELIVERY_DATE: '2024-01-25T09:45:00Z',
        TOTAL_COST: 350.00,
        RECEIPT_NO: 'REC-2024-003',
        RECEIPT_PHOTO: null,
        STATUS: 'received',
        REMARKS: 'Out for delivery - expected today',
        PO_ID: 3,
        SUPPLIER_ID: 2,
        SUPPLIER_NAME: 'Tool Distributors Ltd.',
        TOTAL_ITEMS: 1,
        TOTAL_VALUE: 350.00,
        DELIVERY_TYPE: 'Item Purchase',
        ITEMS: [
            {
                ID: 8004,
                ITEM_ID: 1004,
                NAME: 'Power Drill Machine',
                ITEM_NAME: 'Power Drill Machine',
                QUANTITY: 1,
                UNIT_PRICE: 350.00,
                BARCODE: '8806091234570',
                CATEGORY: 'Tools',
                TOTAL_VALUE: 350.00
            }
        ]
    },
    {
        ID: 4,
        DELIVERY_DATE: '2024-02-01T11:20:00Z',
        TOTAL_COST: 189.99,
        RECEIPT_NO: 'REC-2024-004',
        RECEIPT_PHOTO: null,
        STATUS: 'received',
        REMARKS: 'Scheduled for next week delivery',
        PO_ID: 4,
        SUPPLIER_ID: 3,
        SUPPLIER_NAME: 'Office World Suppliers',
        TOTAL_ITEMS: 1,
        TOTAL_VALUE: 189.99,
        DELIVERY_TYPE: 'Item Purchase',
        ITEMS: [
            {
                ID: 8005,
                ITEM_ID: 1008,
                NAME: 'Office Chair Ergonomic',
                ITEM_NAME: 'Office Chair Ergonomic',
                QUANTITY: 1,
                UNIT_PRICE: 189.99,
                BARCODE: '8806091234574',
                CATEGORY: 'Office Supplies',
                TOTAL_VALUE: 189.99
            }
        ]
    },
    {
        ID: 5,
        DELIVERY_DATE: '2024-02-10T16:00:00Z',
        TOTAL_COST: 450.00,
        RECEIPT_NO: 'REC-2024-005',
        RECEIPT_PHOTO: null,
        STATUS: 'received',
        REMARKS: 'Cancelled by customer request',
        PO_ID: 5,
        SUPPLIER_ID: 1,
        SUPPLIER_NAME: 'Electrical Supplies Co.',
        TOTAL_ITEMS: 25,
        TOTAL_VALUE: 450.00,
        DELIVERY_TYPE: 'Service Delivery',
        ITEMS: [
            {
                ID: 8006,
                ITEM_ID: 1005,
                NAME: 'LED Light Bulbs 10W',
                ITEM_NAME: 'LED Light Bulbs 10W',
                QUANTITY: 20,
                UNIT_PRICE: 8.99,
                BARCODE: '8806091234571',
                CATEGORY: 'Electrical',
                TOTAL_VALUE: 179.80
            },
            {
                ID: 8007,
                ITEM_ID: 1010,
                NAME: 'Industrial Extension Cord',
                ITEM_NAME: 'Industrial Extension Cord',
                QUANTITY: 5,
                UNIT_PRICE: 32.40,
                BARCODE: '8806091234576',
                CATEGORY: 'Electrical',
                TOTAL_VALUE: 162.00
            }
        ]
    },
    {
        ID: 6,
        DELIVERY_DATE: '2024-02-15T13:30:00Z',
        TOTAL_COST: 875.25,
        RECEIPT_NO: 'REC-2024-006',
        RECEIPT_PHOTO: null,
        STATUS: 'with returns',
        REMARKS: 'Partial delivery - balance to follow',
        PO_ID: 6,
        SUPPLIER_ID: 2,
        SUPPLIER_NAME: 'Tool Distributors Ltd.',
        TOTAL_ITEMS: 8,
        TOTAL_VALUE: 875.25,
        DELIVERY_TYPE: 'Item Return',
        ITEMS: [
            {
                ID: 8008,
                ITEM_ID: 1006,
                NAME: 'Safety Helmet',
                ITEM_NAME: 'Safety Helmet',
                QUANTITY: 5,
                UNIT_PRICE: 25.50,
                BARCODE: '8806091234572',
                CATEGORY: 'Safety Equipment',
                TOTAL_VALUE: 127.50
            },
            {
                ID: 8009,
                ITEM_ID: 1007,
                NAME: 'Measuring Tape',
                ITEM_NAME: 'Measuring Tape',
                QUANTITY: 3,
                UNIT_PRICE: 12.25,
                BARCODE: '8806091234573',
                CATEGORY: 'Tools',
                TOTAL_VALUE: 36.75
            }
        ]
    },
    {
        ID: 7,
        DELIVERY_DATE: '2024-02-20T10:00:00Z',
        TOTAL_COST: 1200.00,
        RECEIPT_NO: 'REC-2024-007',
        RECEIPT_PHOTO: null,
        STATUS: 'received',
        REMARKS: 'Delayed due to weather conditions',
        PO_ID: 7,
        SUPPLIER_ID: 1,
        SUPPLIER_NAME: 'Electrical Supplies Co.',
        TOTAL_ITEMS: 15,
        TOTAL_VALUE: 1200.00,
        DELIVERY_TYPE: 'Service Rework',
        ITEMS: [
            {
                ID: 8010,
                ITEM_ID: 1009,
                NAME: 'Circuit Breaker',
                ITEM_NAME: 'Circuit Breaker',
                QUANTITY: 10,
                UNIT_PRICE: 45.00,
                BARCODE: '8806091234575',
                CATEGORY: 'Electrical',
                TOTAL_VALUE: 450.00
            },
            {
                ID: 8011,
                ITEM_ID: 1011,
                NAME: 'Voltage Tester',
                ITEM_NAME: 'Voltage Tester',
                QUANTITY: 5,
                UNIT_PRICE: 28.00,
                BARCODE: '8806091234577',
                CATEGORY: 'Tools',
                TOTAL_VALUE: 140.00
            }
        ]
    },
    {
        ID: 8,
        DELIVERY_DATE: '2024-02-25T09:15:00Z',
        TOTAL_COST: 920.00,
        RECEIPT_NO: 'REC-2024-008',
        RECEIPT_PHOTO: null,
        STATUS: 'received',
        REMARKS: 'IT support services completed',
        PO_ID: 5,
        SUPPLIER_ID: 3,
        SUPPLIER_NAME: 'Tech Solutions Inc.',
        TOTAL_ITEMS: 0,
        TOTAL_VALUE: 920.00,
        DELIVERY_TYPE: 'Service Delivery',
        ITEMS: [],
        SERVICES: [
            {
                ID: 1,
                SERVICE_ID: 1,
                NAME: 'IT Support',
                DESCRIPTION: 'Technical support and IT services',
                QUANTITY: 8,
                UNIT_PRICE: 75.00,
                TOTAL_VALUE: 600.00
            },
            {
                ID: 2,
                SERVICE_ID: 7,
                NAME: 'Network Installation',
                DESCRIPTION: 'Network cabling and setup',
                QUANTITY: 4,
                UNIT_PRICE: 80.00,
                TOTAL_VALUE: 320.00
            }
        ]
    },
    {
        ID: 9,
        DELIVERY_DATE: '2024-03-01T14:30:00Z',
        TOTAL_COST: 450.00,
        RECEIPT_NO: 'REC-2024-009',
        RECEIPT_PHOTO: null,
        STATUS: 'received',
        REMARKS: 'Post-renovation cleaning completed',
        PO_ID: 6,
        SUPPLIER_ID: 6,
        SUPPLIER_NAME: 'CleanPro Services',
        TOTAL_ITEMS: 0,
        TOTAL_VALUE: 450.00,
        DELIVERY_TYPE: 'Service Delivery',
        ITEMS: [],
        SERVICES: [
            {
                ID: 4,
                SERVICE_ID: 4,
                NAME: 'Cleaning Services',
                DESCRIPTION: 'Office and facility cleaning',
                QUANTITY: 10,
                UNIT_PRICE: 45.00,
                TOTAL_VALUE: 450.00
            }
        ]
    },
    {
        ID: 10,
        DELIVERY_DATE: '2024-03-05T11:00:00Z',
        TOTAL_COST: 350.00,
        RECEIPT_NO: 'REC-2024-010',
        RECEIPT_PHOTO: null,
        STATUS: 'with returns',
        REMARKS: 'Plumbing repair with some parts returned',
        PO_ID: 9,
        SUPPLIER_ID: 5,
        SUPPLIER_NAME: 'PipeMasters Plumbing',
        TOTAL_ITEMS: 0,
        TOTAL_VALUE: 350.00,
        DELIVERY_TYPE: 'Service Rework',
        ITEMS: [],
        SERVICES: [
            {
                ID: 10,
                SERVICE_ID: 3,
                NAME: 'Plumbing Services',
                DESCRIPTION: 'Pipe installation and plumbing repairs',
                QUANTITY: 5,
                UNIT_PRICE: 70.00,
                TOTAL_VALUE: 350.00
            }
        ]
    }
];

export default deliveries;
