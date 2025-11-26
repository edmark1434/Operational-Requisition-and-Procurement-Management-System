// datasets/requisition_service.ts
const requisitionServiceData = [
    {
        ID: 1,
        REQ_ID: 3, // Connected to requisition ID 3
        SERVICE_ID: 1, // IT Support
        ITEM_ID: null, // Optional item link
        QUANTITY: 8, // Hours
        UNIT_PRICE: 75.00,
        TOTAL: 600.00
    },
    {
        ID: 2,
        REQ_ID: 3, // Same requisition, multiple services
        SERVICE_ID: 7, // Network Installation
        ITEM_ID: 15, // Network cables item
        QUANTITY: 4,
        UNIT_PRICE: 80.00,
        TOTAL: 320.00
    },
    {
        ID: 3,
        REQ_ID: 4, // Another service requisition
        SERVICE_ID: 2, // Electrical Installation
        ITEM_ID: null,
        QUANTITY: 6,
        UNIT_PRICE: 85.00,
        TOTAL: 510.00
    },
    {
        ID: 4,
        REQ_ID: 5, // Service requisition
        SERVICE_ID: 4, // Cleaning Services
        ITEM_ID: 22, // Cleaning supplies
        QUANTITY: 10,
        UNIT_PRICE: 45.00,
        TOTAL: 450.00
    },
    {
        ID: 5,
        REQ_ID: 6, // Mixed service requisition
        SERVICE_ID: 5, // Catering Services
        ITEM_ID: null,
        QUANTITY: 5,
        UNIT_PRICE: 60.00,
        TOTAL: 300.00
    },
    {
        ID: 6,
        REQ_ID: 6, // Same requisition, different service
        SERVICE_ID: 6, // Security Services
        ITEM_ID: null,
        QUANTITY: 8,
        UNIT_PRICE: 55.00,
        TOTAL: 440.00
    },
    {
        ID: 7,
        REQ_ID: 7, // Service requisition
        SERVICE_ID: 8, // HVAC Maintenance
        ITEM_ID: 18, // HVAC filters
        QUANTITY: 3,
        UNIT_PRICE: 90.00,
        TOTAL: 270.00
    },
    {
        ID: 8,
        REQ_ID: 8, // Service requisition
        SERVICE_ID: 9, // Landscaping Services
        ITEM_ID: 25, // Gardening tools
        QUANTITY: 4,
        UNIT_PRICE: 50.00,
        TOTAL: 200.00
    },
    {
        ID: 9,
        REQ_ID: 9, // Service requisition
        SERVICE_ID: 10, // Equipment Calibration
        ITEM_ID: null,
        QUANTITY: 2,
        UNIT_PRICE: 95.00,
        TOTAL: 190.00
    },
    {
        ID: 10,
        REQ_ID: 10, // Service requisition
        SERVICE_ID: 3, // Plumbing Services
        ITEM_ID: 12, // Plumbing parts
        QUANTITY: 5,
        UNIT_PRICE: 70.00,
        TOTAL: 350.00
    }
];

export default requisitionServiceData;
