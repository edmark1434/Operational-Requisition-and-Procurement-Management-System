const userPermissions = [
    // John Doe (2001) - Admin role permissions
    {
        UP_ID: 3001,
        US_ID: 2001,
        PERM_ID: "4001"  // VIEW_REQUISITIONS
    },
    {
        UP_ID: 3002,
        US_ID: 2001,
        PERM_ID: "4002"  // CREATE_REQUISITION
    },
    // ... (Admin has all permissions via role, so minimal direct permissions needed)

    // Maria Garcia (2002) - Manager role permissions
    {
        UP_ID: 3003,
        US_ID: 2002,
        PERM_ID: "4001"  // VIEW_REQUISITIONS
    },
    {
        UP_ID: 3004,
        US_ID: 2002,
        PERM_ID: "4003"  // APPROVE_REQUISITION
    },

    // David Johnson (2003) - Encoder role permissions
    {
        UP_ID: 3005,
        US_ID: 2003,
        PERM_ID: "4001"  // VIEW_REQUISITIONS
    },
    {
        UP_ID: 3006,
        US_ID: 2003,
        PERM_ID: "4002"  // CREATE_REQUISITION
    }
];

export default userPermissions;
