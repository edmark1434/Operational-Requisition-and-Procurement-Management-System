import reworksData from '@/pages/datasets/reworks';
import reworkServiceData from '@/pages/datasets/rework_service';
import serviceData from '@/pages/datasets/service';

export const transformReworksData = () => {
    return reworksData.map(rework => {
        // Get associated services from rework_service junction table and include quantity from reworks data
        const associatedServices = reworkServiceData
            .filter(rs => rs.REWORK_ID === rework.ID)
            .map(rs => {
                const service = serviceData.find(s => s.ID === rs.SERVICE_ID);
                // Find the service in the rework's SERVICES array to get the quantity
                const reworkService = rework.SERVICES.find((s: any) => s.SERVICE_ID === rs.SERVICE_ID);

                return service ? {
                    ID: service.ID,
                    NAME: service.NAME,
                    DESCRIPTION: service.DESCRIPTION,
                    HOURLY_RATE: service.HOURLY_RATE,
                    QUANTITY: reworkService?.QUANTITY || 1 // Get quantity from rework data or default to 1
                } : null;
            })
            .filter(Boolean);

        return {
            ID: rework.ID,
            CREATED_AT: rework.CREATED_AT,
            STATUS: rework.STATUS,
            REMARKS: rework.REMARKS,
            PO_ID: rework.PO_ID,
            SUPPLIER_NAME: rework.SUPPLIER_NAME,
            SERVICES: associatedServices,
            TOTAL_COST: associatedServices.reduce((total, service) => {
                // Type guard to ensure service is not null
                if (!service) return total;
                return total + (service.HOURLY_RATE * service.QUANTITY);
            }, 0)
        };
    });
};
