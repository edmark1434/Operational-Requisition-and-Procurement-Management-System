// delivery.js
const deliveries = [
    {
        ID: 1,
        DELIVERY_DATE: '2024-01-20',
        TOTAL_COST: 15000,
        RECEIPT_NO: 'REC-2024-001',
        RECEIPT_PHOTO: null,
        STATUS: 'delivered',
        REMARKS: 'All items delivered in good condition',
        PO_ID: 1,
        SUPPLIER_ID: 1,
        SUPPLIER_NAME: 'Electrical Supplies Co.',
        ITEMS: [
            {
                ID: 8001,
                ITEM_ID: 1004,
                NAME: 'Power Drill Machine',
                QUANTITY: 5,
                UNIT_PRICE: 350.00,
                BARCODE: '8806091234570',
                CATEGORY: 'Tools'
            },
            {
                ID: 8002,
                ITEM_ID: 1002,
                NAME: 'Electrical Wire 2.5mm',
                QUANTITY: 2,
                UNIT_PRICE: 120.75,
                BARCODE: '8806091234568',
                CATEGORY: 'Electrical'
            }
        ]
    },
    {
        ID: 2,
        DELIVERY_DATE: '2024-01-18',
        TOTAL_COST: 152.50,
        RECEIPT_NO: 'REC-2024-002',
        RECEIPT_PHOTO: null,
        STATUS: 'delivered',
        REMARKS: 'Office supplies delivered',
        PO_ID: 2,
        SUPPLIER_ID: 3,
        SUPPLIER_NAME: 'Office World Suppliers',
        ITEMS: [
            {
                ID: 8003,
                ITEM_ID: 1003,
                NAME: 'Printer Paper A4',
                QUANTITY: 10,
                UNIT_PRICE: 15.25,
                BARCODE: '8806091234569',
                CATEGORY: 'Office Supplies'
            }
        ]
    },
    {
        ID: 3,
        DELIVERY_DATE: '2024-01-25',
        TOTAL_COST: 350.00,
        RECEIPT_NO: 'REC-2024-003',
        RECEIPT_PHOTO: null,
        STATUS: 'delivered',
        REMARKS: 'Single item delivery',
        PO_ID: 3,
        SUPPLIER_ID: 2,
        SUPPLIER_NAME: 'Tool Distributors Ltd.',
        ITEMS: [
            {
                ID: 8004,
                ITEM_ID: 1004,
                NAME: 'Power Drill Machine',
                QUANTITY: 1,
                UNIT_PRICE: 350.00,
                BARCODE: '8806091234570',
                CATEGORY: 'Tools'
            }
        ]
    },
    {
        ID: 4,
        DELIVERY_DATE: '2024-02-01',
        TOTAL_COST: 189.99,
        RECEIPT_NO: 'REC-2024-004',
        RECEIPT_PHOTO: null,
        STATUS: 'delivered',
        REMARKS: 'New equipment for admin',
        PO_ID: 4,
        SUPPLIER_ID: 3,
        SUPPLIER_NAME: 'Office World Suppliers',
        ITEMS: [
            {
                ID: 8005,
                ITEM_ID: 1008,
                NAME: 'Office Chair Ergonomic',
                QUANTITY: 1,
                UNIT_PRICE: 189.99,
                BARCODE: '8806091234574',
                CATEGORY: 'Office Supplies'
            }
        ]
    },
    {
        ID: 5,
        DELIVERY_DATE: '2024-02-10',
        TOTAL_COST: 450.00,
        RECEIPT_NO: 'REC-2024-005',
        RECEIPT_PHOTO: null,
        STATUS: 'delivered',
        REMARKS: 'Mixed items delivery',
        PO_ID: 5,
        SUPPLIER_ID: 1,
        SUPPLIER_NAME: 'Electrical Supplies Co.',
        ITEMS: [
            {
                ID: 8006,
                ITEM_ID: 1005,
                NAME: 'LED Light Bulbs 10W',
                QUANTITY: 20,
                UNIT_PRICE: 8.99,
                BARCODE: '8806091234571',
                CATEGORY: 'Electrical'
            },
            {
                ID: 8007,
                ITEM_ID: 1010,
                NAME: 'Industrial Extension Cord',
                QUANTITY: 5,
                UNIT_PRICE: 32.40,
                BARCODE: '8806091234576',
                CATEGORY: 'Electrical'
            }
        ]
    }
];

export default deliveries;
