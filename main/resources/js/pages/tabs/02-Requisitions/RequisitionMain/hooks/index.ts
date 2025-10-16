import { useMemo } from 'react';

export const useRequisitionFilters = (
    requisitions: any[],
    searchTerm: string,
    statusFilter: string,
    priorityFilter: string,
    categoryFilter: string
) => {
    const filteredRequisitions = useMemo(() => {
        return requisitions.filter(requisition => {
            const matchesSearch =
                requisition.REQUESTOR.toLowerCase().includes(searchTerm.toLowerCase()) ||
                requisition.REMARKS.toLowerCase().includes(searchTerm.toLowerCase()) ||
                requisition.NOTES.toLowerCase().includes(searchTerm.toLowerCase()) ||
                requisition.ID.toString().includes(searchTerm) ||
                requisition.ITEMS.some((item: any) =>
                    item.NAME.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesStatus = statusFilter === 'All' || requisition.STATUS === statusFilter;
            const matchesPriority = priorityFilter === 'All' || requisition.PRIORITY === priorityFilter;
            const matchesCategory = categoryFilter === 'All' || requisition.CATEGORIES.includes(categoryFilter);

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
        });
    }, [requisitions, searchTerm, statusFilter, priorityFilter, categoryFilter]);

    const statuses = useMemo(() => ['All', ...new Set(requisitions.map(req => req.STATUS))], [requisitions]);
    const priorities = useMemo(() => ['All', ...new Set(requisitions.map(req => req.PRIORITY))], [requisitions]);
    const allCategories = useMemo(() => ['All', ...new Set(requisitions.flatMap(req => req.CATEGORIES))], [requisitions]);

    return {
        filteredRequisitions,
        statuses,
        priorities,
        allCategories
    };
};
