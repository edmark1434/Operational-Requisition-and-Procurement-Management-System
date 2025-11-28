// reworks.js
const reworks = [
    {
        ID: 1,
        CREATED_AT: '2024-01-25',
        STATUS: 'Pending',
        REMARKS: 'Repair needed for faulty installation',
        PO_ID: 5,
        SUPPLIER_NAME: 'Tech Solutions Inc.',
        SERVICES: [
            {
                ID: 1,
                SERVICE_ID: 1,
                NAME: 'IT Support',
                DESCRIPTION: 'Technical support and IT services',
                QUANTITY: 2,
                UNIT_PRICE: 75.00
            }
        ]
    },
    {
        ID: 2,
        CREATED_AT: '2024-02-01',
        STATUS: 'Pending',
        REMARKS: 'HVAC system not cooling properly',
        PO_ID: 7,
        SUPPLIER_NAME: 'Climate Control Experts',
        SERVICES: [
            {
                ID: 2,
                SERVICE_ID: 8,
                NAME: 'HVAC Maintenance',
                DESCRIPTION: 'Heating and cooling system maintenance',
                QUANTITY: 1,
                UNIT_PRICE: 90.00
            }
        ]
    },
    {
        ID: 3,
        CREATED_AT: '2024-02-05',
        STATUS: 'Pending',
        REMARKS: 'Plumbing leak needs rework',
        PO_ID: 9,
        SUPPLIER_NAME: 'PipeMasters Plumbing',
        SERVICES: [
            {
                ID: 3,
                SERVICE_ID: 3,
                NAME: 'Plumbing Services',
                DESCRIPTION: 'Pipe installation and plumbing repairs',
                QUANTITY: 3,
                UNIT_PRICE: 70.00
            }
        ]
    }
];

export default reworks;
