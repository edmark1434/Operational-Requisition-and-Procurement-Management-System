import {RequisitionService, Service} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";

export interface GroupedService {
    service_id: number;
    service: Service;
    reqServices: RequisitionService[];
    categoryId: number;
}

export const groupRequisitionServices = (reqServices: RequisitionService[]): GroupedService[] => {
    const grouped = reqServices.reduce((acc, reqService) => {
        const key = reqService.service_id;

        if (!acc[key]) {
            acc[key] = {
                service_id: reqService.service_id,
                service: reqService.service,
                reqServices: [],
                categoryId: reqService.service.category_id,
            };
        }

        acc[key].reqServices.push(reqService);

        return acc;
    }, {} as Record<number, GroupedService>);

    return Object.values(grouped);
};
