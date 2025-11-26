// requisition.js
const requisitions = [
    {
        ID: 5001,
        TYPE: "items",
        CREATED_AT: "2024-01-15 09:30:00",
        UPDATED_AT: "2024-01-16 14:20:00",
        STATUS: "Approved",
        NOTES: "For maintenance department",
        REQUESTOR: "John Smith",
        PRIORITY: "Normal",
        REMARKS: "Approved by manager",
        USER_ID: 2001
    },
    {
        ID: 5002,
        TYPE: "items",
        CREATED_AT: "2024-01-16 11:15:00",
        UPDATED_AT: "2024-01-16 16:45:00",
        STATUS: "Approved",
        NOTES: "Urgent requirement",
        REQUESTOR: "Maria Garcia",
        PRIORITY: "Urgent",
        REMARKS: "Budget constraints",
        USER_ID: 2002
    },
    {
        ID: 5003,
        TYPE: "items",
        CREATED_AT: "2024-01-17 08:45:00",
        UPDATED_AT: "2024-01-17 08:45:00",
        STATUS: "Pending",
        NOTES: "New project requirement",
        REQUESTOR: "David Johnson",
        PRIORITY: "High",
        REMARKS: "",
        USER_ID: 2003
    },
    // New service requisitions
    {
        ID: 5004,
        TYPE: "services",
        CREATED_AT: "2024-01-18 10:15:00",
        UPDATED_AT: "2024-01-18 10:15:00",
        STATUS: "Approved",
        NOTES: "IT support and network setup for new office",
        REQUESTOR: "IT Department",
        PRIORITY: "High",
        REMARKS: "Approved - budget allocated",
        USER_ID: 2004
    },
    {
        ID: 5005,
        TYPE: "services",
        CREATED_AT: "2024-01-19 11:00:00",
        UPDATED_AT: "2024-01-19 11:00:00",
        STATUS: "Pending",
        NOTES: "Electrical work for conference room",
        REQUESTOR: "Facilities Manager",
        PRIORITY: "Normal",
        REMARKS: "",
        USER_ID: 2005
    },
    {
        ID: 5006,
        TYPE: "services",
        CREATED_AT: "2024-01-20 08:45:00",
        UPDATED_AT: "2024-01-20 08:45:00",
        STATUS: "Approved",
        NOTES: "Deep cleaning after renovation",
        REQUESTOR: "Operations",
        PRIORITY: "Urgent",
        REMARKS: "Approved - immediate action required",
        USER_ID: 2006
    },
    {
        ID: 5007,
        TYPE: "items",
        CREATED_AT: "2024-01-21 13:30:00",
        UPDATED_AT: "2024-01-21 13:30:00",
        STATUS: "Pending",
        NOTES: "Office supplies restock",
        REQUESTOR: "Admin Department",
        PRIORITY: "Normal",
        REMARKS: "",
        USER_ID: 2007
    },
    {
        ID: 5008,
        TYPE: "services",
        CREATED_AT: "2024-01-22 09:15:00",
        UPDATED_AT: "2024-01-22 09:15:00",
        STATUS: "Approved",
        NOTES: "HVAC system maintenance",
        REQUESTOR: "Facilities",
        PRIORITY: "High",
        REMARKS: "Approved - seasonal maintenance",
        USER_ID: 2005
    },
    {
        ID: 5009,
        TYPE: "items",
        CREATED_AT: "2024-01-23 14:00:00",
        UPDATED_AT: "2024-01-23 14:00:00",
        STATUS: "Pending",
        NOTES: "Tools for maintenance team",
        REQUESTOR: "Maintenance Department",
        PRIORITY: "Normal",
        REMARKS: "",
        USER_ID: 2001
    },
    {
        ID: 5010,
        TYPE: "services",
        CREATED_AT: "2024-01-24 16:45:00",
        UPDATED_AT: "2024-01-24 16:45:00",
        STATUS: "Pending",
        NOTES: "Plumbing repair in break room",
        REQUESTOR: "Facilities",
        PRIORITY: "Urgent",
        REMARKS: "",
        USER_ID: 2005
    }
];

export default requisitions;
