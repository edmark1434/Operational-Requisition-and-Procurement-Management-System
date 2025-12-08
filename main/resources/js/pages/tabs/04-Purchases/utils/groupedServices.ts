import { RequisitionService, Service } from "@/pages/tabs/04-Purchases/PurchaseOrderForm";
import { RequisitionOrderService } from "@/pages/tabs/04-Purchases/PurchaseOrderEdit";

export interface GroupedService {
    service_id: number;
    service: Service;
    reqServices: RequisitionService[]; // Original reqService references
    categoryId: number;
    isOrdered: boolean; // True if at least one ordered version exists
}

export const groupRequisitionServices = (
    reqServices: RequisitionService[],
    requisitionOrderServices: RequisitionOrderService[] = []
): GroupedService[] => {
    // Build a quick lookup set of ordered req_service ids
    const orderedReqServiceIds = new Set<number>(
        requisitionOrderServices.map(ro => ro.req_service_id)
    );

    const grouped: Record<string, GroupedService> = {};

    for (const reqService of reqServices) {
        const isOrdered = orderedReqServiceIds.has(reqService.id);
        const groupKey = `${reqService.service_id}-${isOrdered ? "ordered" : "not"}`;

        if (!grouped[groupKey]) {
            grouped[groupKey] = {
                service_id: reqService.service_id,
                service: reqService.service,
                reqServices: [],
                categoryId: reqService.service.category_id,
                isOrdered: isOrdered,
            };
        }

        grouped[groupKey].reqServices.push(reqService);
    }

    return Object.values(grouped);
};
