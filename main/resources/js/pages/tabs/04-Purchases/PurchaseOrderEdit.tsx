import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import datasets
import requisitionsData from '@/pages/datasets/requisition';
import requisitionItemsData from '@/pages/datasets/requisition_item';
import requisitionServiceData from '@/pages/datasets/requisition_service';
import itemsData from '@/pages/datasets/items';
import serviceData from '@/pages/datasets/service';
import categoriesData from '@/pages/datasets/category';
import suppliersData from '@/pages/datasets/supplier';
import { purchaseOrdersData } from '@/pages/datasets/purchase_order';

// Import supplier suggestions
import { getSuggestedSuppliers, getBestSupplier, type SuggestedSupplier } from './utils/supplierSuggestions';

// Import modular components
import OrderInfo from './PurchaseOrderForm/OrderInfo';
import SelectSupplier from './PurchaseOrderForm/SelectSupplier';
import OrderItems from './PurchaseOrderForm/OrderItems';
import OrderService from './PurchaseOrderForm/OrderService';
import AdditionalInfo from './PurchaseOrderForm/AdditionalInfo';
import PreviewModal from './PurchaseOrderForm/PreviewModal';

// Import UI components
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import utilities
import { getStatusColor, getStatusDisplayName } from './utils/purchaseCalculations';

interface PageProps {
    purchaseId: number;
}

interface PurchaseOrderItem {
    ID: number;
    ITEM_ID: number;
    NAME: string;
    QUANTITY: number;
    UNIT_PRICE: number;
    CATEGORY_ID: number;
    SELECTED: boolean;
    REQUISITION_ID?: number;
    CATEGORY?: string;
}

interface PurchaseOrderService {
    ID: number;
    SERVICE_ID: number;
    NAME: string;
    DESCRIPTION: string;
    QUANTITY: number;
    UNIT_PRICE: number;
    SELECTED: boolean;
    REQUISITION_ID?: number;
    CATEGORY?: string;
}

interface FormData {
    REFERENCE_NO: string;
    REQUISITION_IDS: string[];
    SUPPLIER_ID: string;
    PAYMENT_TYPE: string;
    ORDER_TYPE?: string;
    REMARKS: string;
    ITEMS: PurchaseOrderItem[];
    SERVICES: PurchaseOrderService[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchases',
        href: '/purchases',
    },
    {
        title: 'Edit Purchase Order',
        href: '/purchases/edit',
    },
];

export default function PurchaseOrderEdit() {
    const { props } = usePage();
    const { purchaseId } = props as unknown as PageProps;

    const currentPurchase = purchaseOrdersData.find(po => po.ID === purchaseId);

    const [formData, setFormData] = useState<FormData>({
        REFERENCE_NO: '',
        REQUISITION_IDS: [],
        SUPPLIER_ID: '',
        PAYMENT_TYPE: 'cash',
        ORDER_TYPE: 'items',
        REMARKS: '',
        ITEMS: [],
        SERVICES: []
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [selectedRequisitions, setSelectedRequisitions] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [approvedRequisitions, setApprovedRequisitions] = useState<any[]>([]);
    const [suggestedSuppliers, setSuggestedSuppliers] = useState<SuggestedSupplier[]>([]);
    const [bestSupplier, setBestSupplier] = useState<SuggestedSupplier | null>(null);
    const [originalQuantities, setOriginalQuantities] = useState<{[key: number]: number}>({});
    const [showPreview, setShowPreview] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditable, setIsEditable] = useState(true);
    const [requisitionOpen, setRequisitionOpen] = useState(false);

    // Load approved requisitions once on component mount
    useEffect(() => {
        const loadApprovedRequisitions = () => {
            const transformedRequisitions = requisitionsData
                .filter(req => req.STATUS === 'Approved')
                .map(requisition => {
                    // Handle items requisitions
                    const requisitionItems = requisitionItemsData.filter(item => item.REQ_ID === requisition.ID);
                    // Handle services requisitions
                    const requisitionServices = requisitionServiceData.filter(service => service.REQ_ID === requisition.ID);

                    const itemsWithDetails = requisitionItems.map(reqItem => {
                        const itemDetails = itemsData.find(item => item.ITEM_ID === reqItem.ITEM_ID);
                        const category = categoriesData.find(cat => cat.CAT_ID === itemDetails?.CATEGORY_ID);
                        return {
                            ID: reqItem.REQT_ID,
                            ITEM_ID: reqItem.ITEM_ID,
                            NAME: itemDetails?.NAME || 'Unknown Item',
                            QUANTITY: reqItem.QUANTITY,
                            CATEGORY: category?.NAME || reqItem.CATEGORY,
                            CATEGORY_ID: category?.CAT_ID,
                            UNIT_PRICE: itemDetails?.UNIT_PRICE || 0,
                            SELECTED: true,
                            REQUISITION_ID: requisition.ID,
                            TYPE: 'item'
                        };
                    });

                    // Services with details
                    const servicesWithDetails = requisitionServices.map(reqService => {
                        const serviceDetails = serviceData.find(service => service.ID === reqService.SERVICE_ID);
                        const category = categoriesData.find(cat => cat.CAT_ID === serviceDetails?.CATEGORY_ID);
                        return {
                            ID: reqService.ID,
                            SERVICE_ID: reqService.SERVICE_ID,
                            NAME: serviceDetails?.NAME || 'Unknown Service',
                            DESCRIPTION: serviceDetails?.DESCRIPTION || '',
                            QUANTITY: reqService.QUANTITY,
                            CATEGORY: category?.NAME || 'Unknown Category',
                            CATEGORY_ID: category?.CAT_ID,
                            UNIT_PRICE: serviceDetails?.HOURLY_RATE || reqService.UNIT_PRICE,
                            SELECTED: true,
                            REQUISITION_ID: requisition.ID,
                            TYPE: 'service'
                        };
                    });

                    const categories = [...new Set([
                        ...itemsWithDetails.map(item => item.CATEGORY),
                        ...servicesWithDetails.map(service => service.CATEGORY)
                    ])];

                    return {
                        ID: requisition.ID,
                        CREATED_AT: requisition.CREATED_AT,
                        UPDATED_AT: requisition.UPDATED_AT,
                        STATUS: requisition.STATUS,
                        REMARKS: requisition.REMARKS || '',
                        USER_ID: requisition.USER_ID,
                        REQUESTOR: requisition.REQUESTOR,
                        PRIORITY: requisition.PRIORITY,
                        NOTES: requisition.NOTES,
                        TYPE: requisition.TYPE,
                        ITEMS: itemsWithDetails,
                        SERVICES: servicesWithDetails,
                        CATEGORIES: categories,
                    };
                });

            setApprovedRequisitions(transformedRequisitions);
        };

        loadApprovedRequisitions();
    }, []);

    // Load data based on mode after approvedRequisitions is set
    useEffect(() => {
        if (currentPurchase) {
            const requisitionIds = [currentPurchase.REQUISITION_ID.toString()];
            const currentRequisition = approvedRequisitions.find(req => req.ID === currentPurchase.REQUISITION_ID);
            const initialSelectedRequisitions = currentRequisition ? [currentRequisition] : [];

            // Transform items to include requisition ID and selection status
            const itemsWithRequisition: PurchaseOrderItem[] = currentPurchase.ITEMS.map(item => {
                const originalItem = itemsData.find(it => it.ITEM_ID === item.ITEM_ID);
                const category = categoriesData.find(cat => cat.CAT_ID === (originalItem?.CATEGORY_ID || item.CATEGORY_ID));

                return {
                    ...item,
                    CATEGORY_ID: originalItem?.CATEGORY_ID || item.CATEGORY_ID,
                    CATEGORY: category?.NAME || 'Unknown Category',
                    SELECTED: true,
                    REQUISITION_ID: currentPurchase.REQUISITION_ID
                };
            });

            // Transform services
            const servicesWithRequisition: PurchaseOrderService[] = currentPurchase.SERVICES.map(service => {
                const originalService = serviceData.find(svc => svc.ID === service.SERVICE_ID);
                const category = categoriesData.find(cat => cat.CAT_ID === originalService?.CATEGORY_ID);

                return {
                    ...service,
                    CATEGORY: category?.NAME || 'Unknown Category',
                    SELECTED: true,
                    REQUISITION_ID: currentPurchase.REQUISITION_ID
                };
            });

            // Determine order type based on requisition and content
            let orderType = currentPurchase.ORDER_TYPE;
            if (!orderType) {
                orderType = currentRequisition?.TYPE || (servicesWithRequisition.length > 0 ? 'services' : 'items');
            }

            setFormData({
                REFERENCE_NO: currentPurchase.REFERENCE_NO,
                REQUISITION_IDS: requisitionIds,
                SUPPLIER_ID: currentPurchase.SUPPLIER_ID.toString(),
                PAYMENT_TYPE: currentPurchase.PAYMENT_TYPE,
                ORDER_TYPE: orderType,
                REMARKS: currentPurchase.REMARKS,
                ITEMS: itemsWithRequisition,
                SERVICES: servicesWithRequisition
            });

            setSelectedRequisitions(initialSelectedRequisitions);
            setSelectedSupplier(suppliersData.find(sup => sup.ID === currentPurchase.SUPPLIER_ID));

            // Check if order is editable (only pending_approval status)
            const editableStatuses = ['pending_approval'];
            setIsEditable(editableStatuses.includes(currentPurchase.STATUS));
        }

        setIsLoading(false);
    }, [currentPurchase, approvedRequisitions]);

    // Update supplier suggestions when items/services change
    useEffect(() => {
        const selectedItems = formData.ITEMS.filter((item: PurchaseOrderItem) => item.SELECTED);
        const selectedServices = formData.SERVICES.filter((service: PurchaseOrderService) => service.SELECTED);

        if (selectedItems.length > 0 || selectedServices.length > 0) {
            // CORRECTED: Pass the required parameters
            const suggestions = getSuggestedSuppliers(selectedItems, selectedServices, formData.ORDER_TYPE);
            const best = getBestSupplier(selectedItems, selectedServices, formData.ORDER_TYPE);
            setSuggestedSuppliers(suggestions);
            setBestSupplier(best);
        } else {
            setSuggestedSuppliers([]);
            setBestSupplier(null);
        }
    }, [formData.ITEMS, formData.SERVICES, formData.ORDER_TYPE]);

    // Store original quantities when requisitions are selected
    useEffect(() => {
        if (selectedRequisitions.length > 0) {
            const originalQty: {[key: number]: number} = {};
            selectedRequisitions.forEach(requisition => {
                // Items
                requisition.ITEMS.forEach((item: any) => {
                    originalQty[item.ID] = item.QUANTITY;
                });
                // Services
                requisition.SERVICES.forEach((service: any) => {
                    originalQty[service.ID] = service.QUANTITY;
                });
            });
            setOriginalQuantities(originalQty);
        }
    }, [selectedRequisitions]);

    // Update selected supplier when formData.SUPPLIER_ID changes
    useEffect(() => {
        if (formData.SUPPLIER_ID) {
            const supplier = suppliersData.find(sup => sup.ID.toString() === formData.SUPPLIER_ID);
            setSelectedSupplier(supplier);
        } else {
            setSelectedSupplier(null);
        }
    }, [formData.SUPPLIER_ID]);

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (formData.REQUISITION_IDS.length === 0) {
            newErrors.REQUISITION_IDS = 'Please select at least one requisition';
        }

        if (!formData.SUPPLIER_ID) {
            newErrors.SUPPLIER_ID = 'Please select a supplier';
        }

        if (!formData.PAYMENT_TYPE) {
            newErrors.PAYMENT_TYPE = 'Please select a payment type';
        }

        // Validate based on order type
        if (formData.ORDER_TYPE === 'items' && formData.ITEMS.filter(item => item.SELECTED).length === 0) {
            newErrors.ITEMS = 'No items selected for purchase';
        } else if (formData.ORDER_TYPE === 'services' && formData.SERVICES.filter(service => service.SELECTED).length === 0) {
            newErrors.SERVICES = 'No services selected for purchase';
        }

        // Validate supplier payment method compatibility
        if (selectedSupplier) {
            if (formData.PAYMENT_TYPE === 'cash' && !selectedSupplier.ALLOWS_CASH) {
                newErrors.PAYMENT_TYPE = 'Selected supplier does not accept cash payments';
            }
            if (formData.PAYMENT_TYPE === 'disbursement' && !selectedSupplier.ALLOWS_DISBURSEMENT) {
                newErrors.PAYMENT_TYPE = 'Selected supplier does not accept disbursement payments';
            }
            if (formData.PAYMENT_TYPE === 'store_credit' && !selectedSupplier.ALLOWS_STORE_CREDIT) {
                newErrors.PAYMENT_TYPE = 'Selected supplier does not accept store credit';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle order type change
    const handleOrderTypeChange = (orderType: string) => {
        if (!isEditable) return;

        setFormData(prev => ({
            ...prev,
            ORDER_TYPE: orderType
        }));

        // Clear items/services when order type changes to avoid mixed content
        if (orderType === 'items') {
            setFormData(prev => ({
                ...prev,
                SERVICES: prev.SERVICES.map(service => ({ ...service, SELECTED: false }))
            }));
        } else if (orderType === 'services') {
            setFormData(prev => ({
                ...prev,
                ITEMS: prev.ITEMS.map(item => ({ ...item, SELECTED: false }))
            }));
        }
    };

    const handleRequisitionSelect = (requisitionId: string) => {
        if (!isEditable) return;

        const requisition = approvedRequisitions.find(req => req.ID.toString() === requisitionId);

        if (requisition && !formData.REQUISITION_IDS.includes(requisitionId)) {
            // Auto-set order type based on requisition type if not set
            let orderType = formData.ORDER_TYPE;
            if (!orderType) {
                orderType = requisition.TYPE;
                setFormData(prev => ({ ...prev, ORDER_TYPE: requisition.TYPE }));
            }

            // Validate order type consistency
            if (orderType && requisition.TYPE !== orderType) {
                alert(`Cannot add ${requisition.TYPE} requisition to ${orderType} purchase order. Please select ${orderType} requisitions only.`);
                return;
            }

            // Add requisition
            const newRequisitionIds = [...formData.REQUISITION_IDS, requisitionId];
            const newSelectedRequisitions = [...selectedRequisitions, requisition];

            // Add items/services from this requisition based on type
            let newItems = [...formData.ITEMS];
            let newServices = [...formData.SERVICES];

            if (requisition.TYPE === 'items') {
                newItems = [
                    ...newItems,
                    ...requisition.ITEMS.map((item: any) => ({
                        ...item,
                        SELECTED: true,
                        REQUISITION_ID: requisition.ID
                    }))
                ];
            } else if (requisition.TYPE === 'services') {
                newServices = [
                    ...newServices,
                    ...requisition.SERVICES.map((service: any) => ({
                        ...service,
                        SELECTED: true,
                        REQUISITION_ID: requisition.ID
                    }))
                ];
            }

            setFormData(prev => ({
                ...prev,
                REQUISITION_IDS: newRequisitionIds,
                ITEMS: newItems,
                SERVICES: newServices
            }));

            setSelectedRequisitions(newSelectedRequisitions);

            // Reset supplier when requisition changes since items/services may be different
            if (formData.SUPPLIER_ID) {
                setFormData(prev => ({ ...prev, SUPPLIER_ID: '' }));
                setSelectedSupplier(null);
            }

            if (errors.REQUISITION_IDS) {
                setErrors(prev => ({ ...prev, REQUISITION_IDS: '' }));
            }
        }

        setRequisitionOpen(false);
    };

    const handleRemoveRequisition = (requisitionId: string) => {
        if (!isEditable) return;

        // Don't allow removing the last requisition
        if (formData.REQUISITION_IDS.length <= 1) {
            alert('You must have at least one requisition selected.');
            return;
        }

        // Remove requisition
        const newRequisitionIds = formData.REQUISITION_IDS.filter(id => id !== requisitionId);
        const newSelectedRequisitions = selectedRequisitions.filter(req => req.ID.toString() !== requisitionId);

        // Remove items/services from this requisition
        const requisitionIdNum = parseInt(requisitionId);
        const newItems = formData.ITEMS.filter(item => item.REQUISITION_ID !== requisitionIdNum);
        const newServices = formData.SERVICES.filter(service => service.REQUISITION_ID !== requisitionIdNum);

        setFormData(prev => ({
            ...prev,
            REQUISITION_IDS: newRequisitionIds,
            ITEMS: newItems,
            SERVICES: newServices
        }));

        setSelectedRequisitions(newSelectedRequisitions);

        // Reset supplier if no items/services left
        if (newItems.length === 0 && newServices.length === 0 && formData.SUPPLIER_ID) {
            setFormData(prev => ({ ...prev, SUPPLIER_ID: '' }));
            setSelectedSupplier(null);
        }
    };

    const handleSupplierChange = (supplierId: string) => {
        if (!isEditable) return;

        // Toggle selection - if clicking the same supplier, deselect it
        const newSupplierId = formData.SUPPLIER_ID === supplierId ? '' : supplierId;

        const supplier = suppliersData.find(sup => sup.ID.toString() === newSupplierId);
        setSelectedSupplier(supplier);

        setFormData(prev => ({
            ...prev,
            SUPPLIER_ID: newSupplierId
        }));

        if (errors.SUPPLIER_ID) {
            setErrors(prev => ({ ...prev, SUPPLIER_ID: '' }));
        }

        // Reset payment type if incompatible with new supplier or if deselecting
        if (supplier) {
            if (formData.PAYMENT_TYPE === 'cash' && !supplier.ALLOWS_CASH) {
                setFormData(prev => ({ ...prev, PAYMENT_TYPE: '' }));
            }
            if (formData.PAYMENT_TYPE === 'disbursement' && !supplier.ALLOWS_DISBURSEMENT) {
                setFormData(prev => ({ ...prev, PAYMENT_TYPE: '' }));
            }
            if (formData.PAYMENT_TYPE === 'store_credit' && !supplier.ALLOWS_STORE_CREDIT) {
                setFormData(prev => ({ ...prev, PAYMENT_TYPE: '' }));
            }
        } else {
            // If deselecting supplier, reset payment type
            setFormData(prev => ({ ...prev, PAYMENT_TYPE: 'cash' }));
        }
    };

    const toggleItemSelection = (itemId: number) => {
        if (!isEditable) return;

        setFormData(prev => ({
            ...prev,
            ITEMS: prev.ITEMS.map(item =>
                item.ID === itemId
                    ? { ...item, SELECTED: !item.SELECTED }
                    : item
            )
        }));
    };

    // Toggle service selection
    const toggleServiceSelection = (serviceId: number) => {
        if (!isEditable) return;

        setFormData(prev => ({
            ...prev,
            SERVICES: prev.SERVICES.map(service =>
                service.ID === serviceId
                    ? { ...service, SELECTED: !service.SELECTED }
                    : service
            )
        }));
    };

    const updateItemQuantity = (itemId: number, quantity: number) => {
        if (!isEditable) return;
        if (quantity < 1) return;

        // Get the original quantity from requisition
        const originalQty = originalQuantities[itemId] || 1;

        // Don't allow decreasing below original requisition quantity
        if (quantity < originalQty) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            ITEMS: prev.ITEMS.map(item =>
                item.ID === itemId
                    ? { ...item, QUANTITY: quantity }
                    : item
            )
        }));
    };

    // Update service quantity
    const updateServiceQuantity = (serviceId: number, quantity: number) => {
        if (!isEditable) return;
        if (quantity < 1) return;

        // Get the original quantity from requisition
        const originalQty = originalQuantities[serviceId] || 1;

        // Don't allow decreasing below original requisition quantity
        if (quantity < originalQty) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            SERVICES: prev.SERVICES.map(service =>
                service.ID === serviceId
                    ? { ...service, QUANTITY: quantity }
                    : service
            )
        }));
    };

    const calculateTotal = () => {
        const itemsTotal = formData.ITEMS
            .filter((item: PurchaseOrderItem) => item.SELECTED)
            .reduce((total: number, item: PurchaseOrderItem) => total + (item.QUANTITY * item.UNIT_PRICE), 0);

        const servicesTotal = formData.SERVICES
            .filter((service: PurchaseOrderService) => service.SELECTED)
            .reduce((total: number, service: PurchaseOrderService) => total + (service.QUANTITY * service.UNIT_PRICE), 0);

        return itemsTotal + servicesTotal;
    };

    const getSelectedItems = () => {
        return formData.ITEMS.filter((item: PurchaseOrderItem) => item.SELECTED);
    };

    // Get selected services
    const getSelectedServices = () => {
        return formData.SERVICES.filter((service: PurchaseOrderService) => service.SELECTED);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditable) {
            alert('This purchase order cannot be edited because it is no longer in pending status.');
            return;
        }

        if (validateForm()) {
            // Show preview instead of directly submitting
            setShowPreview(true);
        }
    };

    const handleConfirmSubmit = () => {
        const selectedItems = getSelectedItems();
        const selectedServices = getSelectedServices();
        const totalCost = calculateTotal();

        const purchaseOrderData = {
            ID: currentPurchase?.ID,
            REFERENCE_NO: formData.REFERENCE_NO,
            REQUISITION_IDS: formData.REQUISITION_IDS.map(id => parseInt(id)),
            SUPPLIER_ID: parseInt(formData.SUPPLIER_ID),
            PAYMENT_TYPE: formData.PAYMENT_TYPE,
            ORDER_TYPE: formData.ORDER_TYPE,
            TOTAL_COST: totalCost,
            STATUS: currentPurchase?.STATUS || 'pending_approval',
            REMARKS: formData.REMARKS,
            CREATED_AT: currentPurchase?.CREATED_AT,
            UPDATED_AT: new Date().toISOString(),
            SUPPLIER_NAME: selectedSupplier?.NAME,
            ITEMS: selectedItems.map(item => ({
                ITEM_ID: item.ITEM_ID,
                QUANTITY: item.QUANTITY,
                UNIT_PRICE: item.UNIT_PRICE,
                NAME: item.NAME,
                CATEGORY_ID: item.CATEGORY_ID,
                REQUISITION_ID: item.REQUISITION_ID
            })),
            SERVICES: selectedServices.map(service => ({
                SERVICE_ID: service.SERVICE_ID,
                QUANTITY: service.QUANTITY,
                UNIT_PRICE: service.UNIT_PRICE,
                NAME: service.NAME,
                DESCRIPTION: service.DESCRIPTION,
                REQUISITION_ID: service.REQUISITION_ID
            }))
        };

        console.log('Updated Purchase Order Data:', purchaseOrderData);

        // In real application, you would send PUT request to backend
        alert(`Purchase order updated successfully! ${formData.REQUISITION_IDS.length > 1 ? `(Merged ${formData.REQUISITION_IDS.length} requisitions)` : ''}`);

        // Close preview and redirect
        setShowPreview(false);

        // Redirect back to purchases list
        router.visit('/purchases');
    };

    const handleInputChange = (field: string, value: any) => {
        if (!isEditable) return;

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleReset = () => {
        if (!isEditable) return;

        if (currentPurchase) {
            // Reset to original values
            const requisitionIds = [currentPurchase.REQUISITION_ID.toString()];
            const currentRequisition = approvedRequisitions.find(req => req.ID === currentPurchase.REQUISITION_ID);
            const initialSelectedRequisitions = currentRequisition ? [currentRequisition] : [];

            const itemsWithRequisition: PurchaseOrderItem[] = currentPurchase.ITEMS.map(item => {
                const originalItem = itemsData.find(it => it.ITEM_ID === item.ITEM_ID);
                const category = categoriesData.find(cat => cat.CAT_ID === (originalItem?.CATEGORY_ID || item.CATEGORY_ID));

                return {
                    ...item,
                    CATEGORY_ID: originalItem?.CATEGORY_ID || item.CATEGORY_ID,
                    CATEGORY: category?.NAME || 'Unknown Category',
                    SELECTED: true,
                    REQUISITION_ID: currentPurchase.REQUISITION_ID
                };
            });

            // Reset services
            const servicesWithRequisition: PurchaseOrderService[] = currentPurchase.SERVICES.map(service => {
                const originalService = serviceData.find(svc => svc.ID === service.SERVICE_ID);
                const category = categoriesData.find(cat => cat.CAT_ID === originalService?.CATEGORY_ID);

                return {
                    ...service,
                    CATEGORY: category?.NAME || 'Unknown Category',
                    SELECTED: true,
                    REQUISITION_ID: currentPurchase.REQUISITION_ID
                };
            });

            setFormData({
                REFERENCE_NO: currentPurchase.REFERENCE_NO,
                REQUISITION_IDS: requisitionIds,
                SUPPLIER_ID: currentPurchase.SUPPLIER_ID.toString(),
                PAYMENT_TYPE: currentPurchase.PAYMENT_TYPE,
                ORDER_TYPE: currentPurchase.ORDER_TYPE,
                REMARKS: currentPurchase.REMARKS,
                ITEMS: itemsWithRequisition,
                SERVICES: servicesWithRequisition
            });

            setSelectedRequisitions(initialSelectedRequisitions);
            setSelectedSupplier(suppliersData.find(sup => sup.ID === currentPurchase.SUPPLIER_ID));
        }
        setErrors({});
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit('/purchases');
        }
    };

    // Filter requisitions by order type for the combobox
    const filteredRequisitions = approvedRequisitions.filter(req => {
        if (!formData.ORDER_TYPE) return true;
        return req.TYPE === formData.ORDER_TYPE;
    });

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Edit Purchase Order" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading purchase order...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!currentPurchase) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Purchase Order Not Found" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Purchase Order Not Found</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">The purchase order you're trying to edit doesn't exist.</p>
                            <Link
                                href="/purchases"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Return to Purchases
                            </Link>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!isEditable) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Cannot Edit Purchase Order" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Cannot Edit Purchase Order
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {currentPurchase.REFERENCE_NO} • {getStatusDisplayName(currentPurchase.STATUS)}
                            </p>
                        </div>
                        <Link
                            href="/purchases"
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Return to Purchases
                        </Link>
                    </div>

                    <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                        <div className="h-full overflow-y-auto">
                            <div className="min-h-full flex items-start justify-center p-6">
                                <div className="w-full max-w-2xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                    <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Read-Only Mode
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            This purchase order cannot be edited in its current status.
                                        </p>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="text-center py-8">
                                            <svg className="w-16 h-16 text-orange-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                Editing Restricted
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                Purchase order <strong>{currentPurchase.REFERENCE_NO}</strong> has status
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getStatusColor(currentPurchase.STATUS)}`}>
                                                    {getStatusDisplayName(currentPurchase.STATUS)}
                                                </span> and cannot be edited.
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                                Only orders with "Pending Approval" status can be edited.
                                            </p>

                                            <div className="flex justify-center gap-3">
                                                <Link
                                                    href="/purchases"
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                                >
                                                    Back to Purchases
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${currentPurchase.REFERENCE_NO}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Purchase Order
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Editing {currentPurchase.REFERENCE_NO} • {getStatusDisplayName(currentPurchase.STATUS)}
                            {formData.ORDER_TYPE && ` • ${formData.ORDER_TYPE.charAt(0).toUpperCase() + formData.ORDER_TYPE.slice(1)} Order`}
                        </p>
                    </div>
                    <Link
                        href="/purchases"
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return to Purchases
                    </Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-7xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                Edit Purchase Order
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Update purchase order {currentPurchase.REFERENCE_NO} • Created {new Date(currentPurchase.CREATED_AT).toLocaleDateString()}
                                                {formData.ORDER_TYPE && ` • ${formData.ORDER_TYPE.charAt(0).toUpperCase() + formData.ORDER_TYPE.slice(1)} Order`}
                                            </p>
                                        </div>
                                    </div>
                                    {formData.REQUISITION_IDS.length > 1 && (
                                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                    Merging {formData.REQUISITION_IDS.length} requisitions into one purchase order
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {formData.REQUISITION_IDS.length > 1 && (
                                        <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                                    Editing: You can add or remove requisitions from this purchase order
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                        {/* Left Column - Order Info & Supplier Selection */}
                                        <div className="xl:col-span-1 space-y-6">
                                            {/* Order Status Display */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
                                                    Order Status
                                                </h3>
                                                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="flex-1">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentPurchase?.STATUS)}`}>
                                                            {getStatusDisplayName(currentPurchase?.STATUS)}
                                                        </span>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            Current status - {isEditable ? 'Editable' : 'Read Only'}
                                                        </p>
                                                        {formData.ORDER_TYPE && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Order Type: <span className="font-medium capitalize">{formData.ORDER_TYPE}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <OrderInfo
                                                formData={formData}
                                                selectedSupplier={selectedSupplier}
                                                errors={errors}
                                                onInputChange={handleInputChange}
                                                isEditMode={true}
                                                onOrderTypeChange={handleOrderTypeChange}
                                            />

                                            <SelectSupplier
                                                formData={formData}
                                                selectedSupplier={selectedSupplier}
                                                suggestedSuppliers={suggestedSuppliers}
                                                suppliersData={suppliersData}
                                                errors={errors}
                                                onSupplierChange={handleSupplierChange}
                                            />
                                        </div>

                                        {/* Right Column - Requisition, Items/Services, and Additional Info */}
                                        <div className="xl:col-span-2 space-y-6">
                                            {/* Approved Requisitions Selection */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
                                                    Edit Requisitions
                                                </h3>

                                                <div className="space-y-3">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Requisitions
                                                    </label>

                                                    {/* Order Type Requirement */}
                                                    {!formData.ORDER_TYPE && (
                                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                                            <div className="flex items-center">
                                                                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                                </svg>
                                                                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                                                    Please select an Order Type first to see available requisitions
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Selected Requisitions Tags */}
                                                    {formData.REQUISITION_IDS.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {selectedRequisitions.map((requisition) => (
                                                                <div
                                                                    key={requisition.ID}
                                                                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                                                >
                                                                    <span>Req #{requisition.ID}</span>
                                                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                                                    <span>{requisition.REQUESTOR}</span>
                                                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                                                    <span className="capitalize">{requisition.TYPE}</span>
                                                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                                                    <span>
                                                                        {requisition.TYPE === 'items'
                                                                            ? `${requisition.ITEMS.length} items`
                                                                            : `${requisition.SERVICES.length} services`
                                                                        }
                                                                    </span>
                                                                    {formData.REQUISITION_IDS.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveRequisition(requisition.ID.toString())}
                                                                            className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Combobox for requisition selection */}
                                                    <Popover open={requisitionOpen} onOpenChange={setRequisitionOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={requisitionOpen}
                                                                className="w-full justify-between"
                                                                disabled={!formData.ORDER_TYPE}
                                                            >
                                                                {formData.REQUISITION_IDS.length > 0
                                                                    ? `${formData.REQUISITION_IDS.length} ${formData.ORDER_TYPE} requisition(s) selected`
                                                                    : formData.ORDER_TYPE
                                                                        ? `Select ${formData.ORDER_TYPE} requisitions...`
                                                                        : "Select order type first..."}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-full p-0">
                                                            <Command>
                                                                <CommandInput placeholder={`Search ${formData.ORDER_TYPE} requisitions...`} className="h-9" />
                                                                <CommandList>
                                                                    <CommandEmpty>
                                                                        {!formData.ORDER_TYPE
                                                                            ? "Please select an order type first"
                                                                            : `No ${formData.ORDER_TYPE} requisitions found.`
                                                                        }
                                                                    </CommandEmpty>
                                                                    <CommandGroup>
                                                                        {filteredRequisitions.map((requisition) => (
                                                                            <CommandItem
                                                                                key={requisition.ID}
                                                                                value={requisition.ID.toString()}
                                                                                onSelect={handleRequisitionSelect}
                                                                                disabled={formData.REQUISITION_IDS.includes(requisition.ID.toString())}
                                                                            >
                                                                                <div className="flex flex-col">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="font-medium">Req #{requisition.ID}</span>
                                                                                        <span className="text-gray-500 dark:text-gray-400">•</span>
                                                                                        <span>{requisition.REQUESTOR}</span>
                                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                                                                            requisition.TYPE === 'items'
                                                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                                                        }`}>
                                                                                            {requisition.TYPE}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        {requisition.TYPE === 'items'
                                                                                            ? `${requisition.ITEMS.length} items • ${requisition.PRIORITY} priority`
                                                                                            : `${requisition.SERVICES.length} services • ${requisition.PRIORITY} priority`
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                                <Check
                                                                                    className={cn(
                                                                                        "ml-auto h-4 w-4",
                                                                                        formData.REQUISITION_IDS.includes(requisition.ID.toString()) ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>

                                                    {errors.REQUISITION_IDS && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.REQUISITION_IDS}</p>
                                                    )}

                                                    {/* Selected Requisitions Details */}
                                                    {selectedRequisitions.length > 0 && (
                                                        <div className="mt-4 space-y-3">
                                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Selected Requisitions Details:
                                                            </h4>
                                                            {selectedRequisitions.map((requisition) => (
                                                                <div key={requisition.ID} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div>
                                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                                Requisition #{requisition.ID}
                                                                            </span>
                                                                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                                                                by {requisition.REQUESTOR}
                                                                            </span>
                                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2 capitalize ${
                                                                                requisition.TYPE === 'items'
                                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                                            }`}>
                                                                                {requisition.TYPE}
                                                                            </span>
                                                                        </div>
                                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                            requisition.PRIORITY === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                                requisition.PRIORITY === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                        }`}>
                                                                            {requisition.PRIORITY}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        <p>
                                                                            <strong>
                                                                                {requisition.TYPE === 'items' ? 'Items:' : 'Services:'}
                                                                            </strong>
                                                                            {requisition.TYPE === 'items'
                                                                                ? ` ${requisition.ITEMS.length}`
                                                                                : ` ${requisition.SERVICES.length}`
                                                                            }
                                                                        </p>
                                                                        <p><strong>Requested:</strong> {new Date(requisition.CREATED_AT).toLocaleDateString()}</p>
                                                                        {requisition.NOTES && (
                                                                            <p><strong>Notes:</strong> {requisition.NOTES}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Conditional rendering based on order type */}
                                            {formData.ORDER_TYPE === 'items' && (
                                                <OrderItems
                                                    formData={formData}
                                                    selectedRequisition={selectedRequisitions}
                                                    originalQuantities={originalQuantities}
                                                    errors={errors}
                                                    onToggleItemSelection={toggleItemSelection}
                                                    onUpdateItemQuantity={updateItemQuantity}
                                                />
                                            )}

                                            {formData.ORDER_TYPE === 'services' && (
                                                <OrderService
                                                    formData={formData}
                                                    selectedRequisition={selectedRequisitions[0]}
                                                    originalQuantities={originalQuantities}
                                                    errors={errors}
                                                    onToggleServiceSelection={toggleServiceSelection}
                                                    onUpdateServiceQuantity={updateServiceQuantity}
                                                />
                                            )}

                                            {/* Selected Supplier Display */}
                                            {selectedSupplier && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Selected Supplier
                                                        </h3>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSupplierChange('')}
                                                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                        >
                                                            Change Supplier
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="font-bold text-lg text-blue-800 dark:text-blue-200">{selectedSupplier.NAME}</p>
                                                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                                <strong>Email:</strong> {selectedSupplier.EMAIL}
                                                            </p>
                                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                <strong>Phone:</strong> {selectedSupplier.CONTACT_NUMBER}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Payment Methods:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {selectedSupplier.ALLOWS_CASH && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                        Cash
                                                                    </span>
                                                                )}
                                                                {selectedSupplier.ALLOWS_DISBURSEMENT && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                        Disbursement
                                                                    </span>
                                                                )}
                                                                {selectedSupplier.ALLOWS_STORE_CREDIT && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                                        Store Credit
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <AdditionalInfo
                                                formData={formData}
                                                onInputChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Reset Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                {formData.REQUISITION_IDS.length > 1
                                                    ? `Update Merged PO (${formData.REQUISITION_IDS.length})`
                                                    : `Update ${formData.ORDER_TYPE ? formData.ORDER_TYPE.charAt(0).toUpperCase() + formData.ORDER_TYPE.slice(1) : ''} Purchase Order`
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <PreviewModal
                    formData={formData}
                    selectedSupplier={selectedSupplier}
                    selectedRequisition={selectedRequisitions}
                    selectedItems={getSelectedItems()}
                    selectedServices={getSelectedServices()}
                    totalCost={calculateTotal()}
                    onConfirm={handleConfirmSubmit}
                    onCancel={() => setShowPreview(false)}
                    isEditMode={true}
                />
            )}
        </AppLayout>
    );
}
