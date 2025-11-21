const permissions = [
    // Requisitions
    {
        PERMISSION_ID: "4001",
        NAME: "VIEW_REQUISITIONS",
        DESCRIPTION: "View requisitions",
        CATEGORY: "Requisitions"
    },
    {
        PERMISSION_ID: "4002",
        NAME: "CREATE_REQUISITION",
        DESCRIPTION: "Create new requisition requests",
        CATEGORY: "Requisitions"
    },
    {
        PERMISSION_ID: "4003",
        NAME: "APPROVE_REQUISITION",
        DESCRIPTION: "Approve or reject requisition requests",
        CATEGORY: "Requisitions"
    },
    {
        PERMISSION_ID: "4004",
        NAME: "MARK_REQUISITION_PICKUP",
        DESCRIPTION: "Mark requisition for pickup",
        CATEGORY: "Requisitions"
    },
    {
        PERMISSION_ID: "4005",
        NAME: "RECEIVE_REQUISITION",
        DESCRIPTION: "Receive requisition",
        CATEGORY: "Requisitions"
    },

    // Purchase Orders
    {
        PERMISSION_ID: "4006",
        NAME: "VIEW_PURCHASE_ORDERS",
        DESCRIPTION: "View purchase orders",
        CATEGORY: "Purchases"
    },
    {
        PERMISSION_ID: "4007",
        NAME: "MERGE_PURCHASE_ORDERS",
        DESCRIPTION: "Merge purchase orders",
        CATEGORY: "Purchases"
    },
    {
        PERMISSION_ID: "4008",
        NAME: "UPDATE_PURCHASE_ORDER",
        DESCRIPTION: "Update purchase order",
        CATEGORY: "Purchases"
    },
    {
        PERMISSION_ID: "4009",
        NAME: "ISSUE_PURCHASE_ORDER",
        DESCRIPTION: "Issue purchase order",
        CATEGORY: "Purchases"
    },

    // Deliveries
    {
        PERMISSION_ID: "4010",
        NAME: "VIEW_DELIVERIES",
        DESCRIPTION: "View deliveries",
        CATEGORY: "Deliveries"
    },
    {
        PERMISSION_ID: "4011",
        NAME: "ADD_DELIVERY",
        DESCRIPTION: "Add delivery",
        CATEGORY: "Deliveries"
    },
    {
        PERMISSION_ID: "4012",
        NAME: "UPDATE_DELIVERY",
        DESCRIPTION: "Update delivery",
        CATEGORY: "Deliveries"
    },

    // Returns
    {
        PERMISSION_ID: "4013",
        NAME: "VIEW_RETURNS",
        DESCRIPTION: "View returns",
        CATEGORY: "Returns"
    },
    {
        PERMISSION_ID: "4014",
        NAME: "CREATE_RETURN",
        DESCRIPTION: "Create return",
        CATEGORY: "Returns"
    },
    {
        PERMISSION_ID: "4015",
        NAME: "MARK_RETURN_STATUS",
        DESCRIPTION: "Mark return as replaced/rejected",
        CATEGORY: "Returns"
    },
    {
        PERMISSION_ID: "4016",
        NAME: "ISSUE_RETURN",
        DESCRIPTION: "Issue return",
        CATEGORY: "Returns"
    },

    // Inventory
    {
        PERMISSION_ID: "4017",
        NAME: "VIEW_ITEMS",
        DESCRIPTION: "View inventory items",
        CATEGORY: "Inventory"
    },
    {
        PERMISSION_ID: "4018",
        NAME: "MANAGE_ITEMS",
        DESCRIPTION: "Manage items",
        CATEGORY: "Inventory"
    },
    {
        PERMISSION_ID: "4019",
        NAME: "VIEW_MAKES",
        DESCRIPTION: "View makes",
        CATEGORY: "Inventory"
    },
    {
        PERMISSION_ID: "4020",
        NAME: "MANAGE_MAKES",
        DESCRIPTION: "Manage makes",
        CATEGORY: "Inventory"
    },
    {
        PERMISSION_ID: "4021",
        NAME: "VIEW_CATEGORIES",
        DESCRIPTION: "View categories",
        CATEGORY: "Inventory"
    },
    {
        PERMISSION_ID: "4022",
        NAME: "MANAGE_CATEGORIES",
        DESCRIPTION: "Manage categories",
        CATEGORY: "Inventory"
    },

    // Suppliers
    {
        PERMISSION_ID: "4023",
        NAME: "VIEW_SUPPLIERS",
        DESCRIPTION: "View suppliers",
        CATEGORY: "Suppliers"
    },
    {
        PERMISSION_ID: "4024",
        NAME: "MANAGE_SUPPLIERS",
        DESCRIPTION: "Manage suppliers",
        CATEGORY: "Suppliers"
    },

    // Users Management
    {
        PERMISSION_ID: "4025",
        NAME: "VIEW_USERS",
        DESCRIPTION: "View users",
        CATEGORY: "Users Management"
    },
    {
        PERMISSION_ID: "4026",
        NAME: "CREATE_USER",
        DESCRIPTION: "Create user",
        CATEGORY: "Users Management"
    },
    {
        PERMISSION_ID: "4027",
        NAME: "UPDATE_USER_PERMISSIONS",
        DESCRIPTION: "Update user permissions",
        CATEGORY: "Users Management"
    },
    {
        PERMISSION_ID: "4028",
        NAME: "UPDATE_USER_PASSWORD",
        DESCRIPTION: "Update user password",
        CATEGORY: "Users Management"
    },
    {
        PERMISSION_ID: "4029",
        NAME: "REMOVE_USER",
        DESCRIPTION: "Remove user",
        CATEGORY: "Users Management"
    },

    // Roles & Permissions
    {
        PERMISSION_ID: "4030",
        NAME: "VIEW_ROLES_PERMISSIONS",
        DESCRIPTION: "View roles and permissions",
        CATEGORY: "Roles & Permissions"
    },
    {
        PERMISSION_ID: "4031",
        NAME: "MANAGE_ROLES",
        DESCRIPTION: "Manage roles",
        CATEGORY: "Roles & Permissions"
    },

    // Settings
    {
        PERMISSION_ID: "4032",
        NAME: "VIEW_SETTINGS",
        DESCRIPTION: "View settings",
        CATEGORY: "Settings"
    },
    {
        PERMISSION_ID: "4033",
        NAME: "UPDATE_SETTINGS",
        DESCRIPTION: "Update settings",
        CATEGORY: "Settings"
    }
];

export default permissions;
