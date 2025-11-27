// datasets/requisition_service.ts
const requisitionServiceData = [
    {
        ID: 1,
        REQ_ID: 5004, // Changed from 3 to 5004 - Connected to requisition ID 5004 (IT support and network setup)
        SERVICE_ID: 1, // IT Support
        ITEM_ID: null, // Optional item link
        QUANTITY: 8, // Hours
        UNIT_PRICE: 75.00,
        TOTAL: 600.00
    },
    {
        ID: 2,
        REQ_ID: 5004, // Changed from 3 to 5004 - Same requisition, multiple services
        SERVICE_ID: 7, // Network Installation
        ITEM_ID: 15, // Network cables item
        QUANTITY: 4,
        UNIT_PRICE: 80.00,
        TOTAL: 320.00
    },
    {
        ID: 3,
        REQ_ID: 5005, // Changed from 4 to 5005 - Electrical work for conference room
        SERVICE_ID: 2, // Electrical Installation
        ITEM_ID: null,
        QUANTITY: 6,
        UNIT_PRICE: 85.00,
        TOTAL: 510.00
    },
    {
        ID: 4,
        REQ_ID: 5006, // Changed from 5 to 5006 - Deep cleaning after renovation
        SERVICE_ID: 4, // Cleaning Services
        ITEM_ID: 22, // Cleaning supplies
        QUANTITY: 10,
        UNIT_PRICE: 45.00,
        TOTAL: 450.00
    },
    {
        ID: 5,
        REQ_ID: 5006, // Changed from 6 to 5006 - Same requisition, different service
        SERVICE_ID: 5, // Catering Services
        ITEM_ID: null,
        QUANTITY: 5,
        UNIT_PRICE: 60.00,
        TOTAL: 300.00
    },
    {
        ID: 6,
        REQ_ID: 5006, // Changed from 6 to 5006 - Same requisition, different service
        SERVICE_ID: 6, // Security Services
        ITEM_ID: null,
        QUANTITY: 8,
        UNIT_PRICE: 55.00,
        TOTAL: 440.00
    },
    {
        ID: 7,
        REQ_ID: 5008, // Changed from 7 to 5008 - HVAC system maintenance
        SERVICE_ID: 8, // HVAC Maintenance
        ITEM_ID: 18, // HVAC filters
        QUANTITY: 3,
        UNIT_PRICE: 90.00,
        TOTAL: 270.00
    },
    {
        ID: 8,
        REQ_ID: 5008, // Changed from 8 to 5008 - Same requisition, different service
        SERVICE_ID: 9, // Landscaping Services
        ITEM_ID: 25, // Gardening tools
        QUANTITY: 4,
        UNIT_PRICE: 50.00,
        TOTAL: 200.00
    },
    {
        ID: 9,
        REQ_ID: 5008, // Changed from 9 to 5008 - Same requisition, different service
        SERVICE_ID: 10, // Equipment Calibration
        ITEM_ID: null,
        QUANTITY: 2,
        UNIT_PRICE: 95.00,
        TOTAL: 190.00
    },
    {
        ID: 10,
        REQ_ID: 5010, // Changed from 10 to 5010 - Plumbing repair in break room
        SERVICE_ID: 3, // Plumbing Services
        ITEM_ID: 12, // Plumbing parts
        QUANTITY: 5,
        UNIT_PRICE: 70.00,
        TOTAL: 350.00
    }
];

export default requisitionServiceData;
