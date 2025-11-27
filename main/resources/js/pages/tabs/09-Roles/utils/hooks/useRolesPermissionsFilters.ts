import { useMemo } from 'react';

export const useRolesPermissionsFilters = (
    roles: any[],
    permissions: any[],
    rolesSearchTerm: string,
    permissionsSearchTerm: string,
    roleStatusFilter: 'all' | 'active' | 'inactive' = 'all',
    permissionCategoryFilter: 'all' | string = 'all'
) => {
    const filteredRoles = useMemo(() => {
        return roles.filter(role => {
            const matchesSearch = rolesSearchTerm === '' ||
                role.NAME.toLowerCase().includes(rolesSearchTerm.toLowerCase()) ||
                role.DESCRIPTION.toLowerCase().includes(rolesSearchTerm.toLowerCase());

            const matchesStatus = roleStatusFilter === 'all' ||
                (roleStatusFilter === 'active' && role.IS_ACTIVE) ||
                (roleStatusFilter === 'inactive' && !role.IS_ACTIVE);

            return matchesSearch && matchesStatus;
        });
    }, [roles, rolesSearchTerm, roleStatusFilter]);

    const filteredPermissions = useMemo(() => {
        return permissions.filter(permission => {
            const matchesSearch = permissionsSearchTerm === '' ||
                permission.NAME.toLowerCase().includes(permissionsSearchTerm.toLowerCase()) ||
                permission.DESCRIPTION.toLowerCase().includes(permissionsSearchTerm.toLowerCase());

            const matchesCategory = permissionCategoryFilter === 'all' ||
                permission.CATEGORY === permissionCategoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [permissions, permissionsSearchTerm, permissionCategoryFilter]);

    return {
        filteredRoles,
        filteredPermissions
    };
};
