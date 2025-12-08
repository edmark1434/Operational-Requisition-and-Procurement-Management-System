import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import datasets
import requisitionItemsData from '@/pages/datasets/requisition_item';
import requisitionServiceData from '@/pages/datasets/requisition_service';
import serviceData from '@/pages/datasets/service';
import itemsData from '@/pages/datasets/items';
import categoriesData from '@/pages/datasets/category';
import suppliersData from '@/pages/datasets/supplier';
import { purchaseOrdersData } from '@/pages/datasets/purchase_order';

// Import supplier suggestions - UPDATED IMPORT
import {getSuggestedSuppliers, SuggestedVendor} from './utils/supplierSuggestions';

// Import modular components
import OrderInfo from './PurchaseOrderForm/OrderInfo';
import SelectSupplier from './PurchaseOrderForm/SelectSupplier';
import OrderItems from './PurchaseOrderForm/OrderItems';
import OrderService from './PurchaseOrderForm/OrderService';
import SelectApprovedRequisition from './PurchaseOrderForm/SelectApprovedRequisition';
import AdditionalInfo from './PurchaseOrderForm/AdditionalInfo';
import PreviewModal from './PurchaseOrderForm/PreviewModal';

// Import UI components
import { Button } from '@/components/ui/button';
import {orderpost, servicepost} from "@/routes";
import {X} from "lucide-react";

interface PageProps {
    purchaseId?: number;
    mode?: 'create' | 'edit';
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchases',
        href: '/purchases',
    },
    {
        title: 'Create Purchase Order',
        href: '/purchases/create',
    },
];

export interface Item {
    id: number;
    barcode: string | null;
    name: string;
    dimensions: string | null;
    unit_price: number;
    current_stock: number;
    is_active: boolean;
    make_id: number | null;
    category_id: number;
    vendor_id: number | null;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
    type: "Items" | "Services";
    is_active: boolean;
}

export interface Service {
    id: number;
    name: string;
    description: string;
    hourly_rate: number;
    is_active: boolean;
    category_id: number;
    vendor_id: number | null;
}

export type Requisition = {
    id: number;
    ref_no: string;
    type: 'Items' | 'Services'; // Requisition::TYPES
    status: string; // based on Requisition::STATUS
    remarks: string | null;
    requestor: string | null;
    notes: string | null;
    total_cost: string | null;
    priority: string; // based on Requisition::PRIORITY
    user_id: number;
    created_at: string;
    updated_at: string;
};

export interface RequisitionItem {
    id: number;
    req_id: number;
    item_id: number;
    item: Item;
    quantity: number;
    approved_qty: number | null;
}

export interface RequisitionService {
    id: number;
    req_id: number;
    service_id: number;
    service: Service;
}

export type Vendor = {
    id: number;
    name: string;
    email: string;
    contact_number: string | null;
    allows_cash: boolean;
    allows_disbursement: boolean;
    allows_store_credit: boolean;
    is_active: boolean;
};

export type CategoryVendor = {
    id: number;
    category_id: number;
    category: Category;
    vendor_id: number;
    vendor: Vendor;
};

export interface PurchaseOrder {
    id: number;
    ref_no: string;
    type: string; // from PurchaseOrder::TYPES (string enum)
    created_at: string; // timestamp
    total_cost: number;
    payment_type: string; // from PurchaseOrder::PAYMENT_TYPE
    status: string; // from PurchaseOrder::STATUS
    remarks: string | null;
    vendor_id: number | null;
}

export interface OrderItem {
    id: number;
    po_id: number;
    item_id: number;
    item: Item;
    quantity: number;
}

export interface OrderService {
    id: number;
    po_id: number;
    service_id: number;
    service: Service;
    item_id: number | null;
    item: Item | null;
}

export interface RequisitionOrderItem {
    id: number;
    req_item_id: number;
    req_item: RequisitionItem;
    po_item_id: number;
    po_item: OrderItem;
}

export interface RequisitionOrderService {
    id: number;
    req_service_id: number;
    req_service: RequisitionService;
    po_service_id: number;
    po_service: OrderService;
}

export default function PurchaseOrderForm() {
    const { requisitions, requisitionItems, requisitionServices, vendors, vendorCategories, purchaseOrders, orderItems, orderServices, requisitionOrderItems, requisitionOrderServices, categories } = usePage<{
        requisitions: Requisition[];
        requisitionItems: RequisitionItem[];
        requisitionServices: RequisitionService[];
        vendors: Vendor[];
        vendorCategories: CategoryVendor[];
        purchaseOrders: PurchaseOrder[];
        orderItems: OrderItem[];
        orderServices: OrderService[];
        requisitionOrderItems: RequisitionOrderItem[];
        requisitionOrderServices: RequisitionOrderService[];
        categories: Category[];
    }>().props;

    const { props } = usePage();
    const { purchaseId, mode = 'create' } = props as PageProps;

    const isEditMode = mode === 'edit';
    const currentPurchase = isEditMode ? purchaseOrders.find(po => po.id === purchaseId) : null;

    const [formData, setFormData] = useState({
        REFERENCE_NO: '',
        REQUISITION_IDS: [] as string[],
        SUPPLIER_ID: '',
        PAYMENT_TYPE: 'Cash',
        REMARKS: '',
        ORDER_TYPE: '', // Add order type to form data
        ITEMS: [] as RequisitionItem[],
        SERVICES: [] as RequisitionService[] // Add services array
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [selectedRequisitions, setSelectedRequisitions] = useState<Requisition[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Vendor | null>(null);
    const [approvedRequisitions, setApprovedRequisitions] = useState<Requisition[]>(requisitions);
    const [suggestedSuppliers, setSuggestedSuppliers] = useState<SuggestedVendor[]>([]);
    const [bestSupplier, setBestSupplier] = useState<SuggestedVendor | null>(null);
    const [originalQuantities, setOriginalQuantities] = useState<{[key: number]: number}>({});
    const [showPreview, setShowPreview] = useState(false);
    const [vendorIsInvalid, setVendorIsInvalid] = useState<boolean>(false);

    // Load data based on mode
    useEffect(() => {
        if (isEditMode && currentPurchase) {
            // Pre-fill form with existing purchase order data
            setFormData({
                REFERENCE_NO: currentPurchase.ref_no,
                REQUISITION_IDS: orderToReqIds(currentPurchase),
                SUPPLIER_ID: currentPurchase.vendor_id?.toString() || '',
                PAYMENT_TYPE: currentPurchase.payment_type,
                REMARKS: currentPurchase.remarks || '',
                ORDER_TYPE: currentPurchase.type,
                ITEMS: orderToReqItems(currentPurchase) || [],
                SERVICES: orderToReqServices(currentPurchase) || []
            });
        } else {
            generateReferenceNumber();
        }
    }, [isEditMode, currentPurchase]);

    // Update supplier suggestions when items/services change - UPDATED USE EFFECT
    useEffect(() => {
        const selectedItems = formData.ITEMS;
        const selectedServices = formData.SERVICES;

        if (selectedItems.length > 0 || selectedServices.length > 0) {
            // UPDATED: Pass both items, services, and order type to the suggestion function
            const suggestions = getSuggestedSuppliers(
                selectedItems,
                selectedServices,
                vendors,
                categories,
                vendorCategories,
                formData.ORDER_TYPE,
            );
            const best = suggestions[0];

            if (best && best.matchPercentage === 100) {
                handleSupplierChange(best.vendor.id.toString());
                setBestSupplier(best);
            }
            else {
                handleSupplierChange('');
                setBestSupplier(null);
            }

            setSuggestedSuppliers(suggestions);
        } else {
            setSuggestedSuppliers([]);
            setBestSupplier(null);
            handleSupplierChange('');
        }
    }, [formData.ITEMS, formData.SERVICES, formData.ORDER_TYPE]); // Added ORDER_TYPE dependency

    // Store original quantities when requisitions are selected
    useEffect(() => {
        if (selectedRequisitions.length > 0) {
            const originalQty: {[key: number]: number} = {};
            const reqItems = requisitionItems.filter(ri => selectedRequisitions.map(req => req.id).includes(ri.req_id));
            const reqServices = requisitionServices.filter(rs => selectedRequisitions.map(req => req.id).includes(rs.req_id));
            if (reqItems) {
                reqItems.forEach((item: any) => {
                    item.quantity = item.approved_qty || item.quantity;
                    originalQty[item.id] = item.quantity;
                });
            }
            if (reqServices) {
                reqServices.forEach((service: any) => {
                    originalQty[service.id] = service.quantity;
                });
            }
            setOriginalQuantities(originalQty);
        }
    }, [selectedRequisitions]);

    // Update selected supplier when formData.SUPPLIER_ID changes
    useEffect(() => {
        if (formData.SUPPLIER_ID) {
            setSelectedSupplier(vendors.find(v => String(v.id) === formData.SUPPLIER_ID) || null);
        } else {
            setSelectedSupplier(null);
        }
    }, [formData.SUPPLIER_ID]);

    const orderToReqItems = (order: PurchaseOrder) => {
        const poItemIds = orderItems.filter(oi => oi.po_id === order.id).map(oi => oi.id);
        const reqItems = requisitionOrderItems.filter(roi => poItemIds.includes(roi.po_item_id)).map(roi => roi.req_item);
        return [...new Set(reqItems)];
    }
    const orderToReqServices = (order: PurchaseOrder) => {
        const poServiceIds = orderServices.filter(os => os.po_id === order.id).map(os => os.id);
        const reqServices = requisitionOrderServices.filter(ros => poServiceIds.includes(ros.po_service_id)).map(ros => ros.req_service);
        return [...new Set(reqServices)];
    }
    const orderToReqIds = (order: PurchaseOrder) => {
        const poItemIds = orderItems.filter(oi => oi.po_id === order.id).map(oi => oi.id);
        const poServiceIds = orderServices.filter(os => os.po_id === order.id).map(os => os.id);
        const reqItems = requisitionOrderItems.filter(roi => poItemIds.includes(roi.po_item_id)).map(roi => roi.req_item);
        const reqServices = requisitionOrderServices.filter(ros => poServiceIds.includes(ros.po_service_id)).map(ros => ros.req_service);
        const reqIds = [...reqItems.map(ri => ri.req_id.toString()), ...reqServices.map(rs => rs.req_id.toString())];
        return [...new Set(reqIds)];
    }

    const generateReferenceNumber = () => {
        let unique = false;
        let reference = '';

        while (!unique) {
            const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
            reference = `PO-${random}`;

            // Check DB if it exists
            const exists = purchaseOrders.some(po => po.ref_no === reference);
            if (!exists) unique = true;
        }

        setFormData(prev => ({ ...prev, REFERENCE_NO: reference }));
    };

    const handleOrderTypeChange = (orderType: string) => {
        // Clear existing selections when order type changes
        if (formData.ORDER_TYPE !== orderType) {
            setFormData(prev => ({
                ...prev,
                ORDER_TYPE: orderType,
                REQUISITION_IDS: [],
                ITEMS: [],
                SERVICES: []
            }));
            setSelectedRequisitions([]);
            setSelectedSupplier(null);
            setOriginalQuantities({});
            setSuggestedSuppliers([]); // Clear suggestions when order type changes
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.ORDER_TYPE) {
            newErrors.ORDER_TYPE = 'Please select an order type';
        }

        if (formData.REQUISITION_IDS.length === 0) {
            newErrors.REQUISITION_IDS = 'Please select at least one requisition';
        }

        if (!formData.SUPPLIER_ID) {
            newErrors.SUPPLIER_ID = 'Please select a vendor';
        }

        if (vendorIsInvalid) {
            newErrors.SUPPLIER_ID = 'Please select another vendor';
        }

        if (!formData.PAYMENT_TYPE) {
            newErrors.PAYMENT_TYPE = 'Please select a payment type';
        }

        if (formData.ORDER_TYPE === 'Items' && formData.ITEMS.length === 0) {
            newErrors.ITEMS = 'No items selected for purchase';
        }

        if (formData.ORDER_TYPE === 'Services' && formData.SERVICES.length === 0) {
            newErrors.SERVICES = 'No services selected for purchase';
        }

        // Validate supplier payment method compatibility
        if (selectedSupplier) {
            if (formData.PAYMENT_TYPE === 'Cash' && !selectedSupplier.allows_cash) {
                newErrors.PAYMENT_TYPE = 'Selected vendor does not accept cash payments';
            }
            if (formData.PAYMENT_TYPE === 'Disbursement' && !selectedSupplier.allows_disbursement) {
                newErrors.PAYMENT_TYPE = 'Selected vendor does not accept disbursement payments';
            }
            if (formData.PAYMENT_TYPE === 'Store Credit' && !selectedSupplier.allows_store_credit) {
                newErrors.PAYMENT_TYPE = 'Selected vendor does not accept store credit';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRequisitionSelect = (requisitionId: string) => {
        const requisition = requisitions.find(req => req.id.toString() === requisitionId);

        if (requisition && !formData.REQUISITION_IDS.includes(requisitionId)) {
            // Add requisition
            const newRequisitionIds = [...formData.REQUISITION_IDS, requisitionId];
            const newSelectedRequisitions = [...selectedRequisitions, requisition];

            setFormData(prev => ({
                ...prev,
                REQUISITION_IDS: newRequisitionIds,
            }));

            setSelectedRequisitions(newSelectedRequisitions);

            if (errors.REQUISITION_IDS) {
                setErrors(prev => ({ ...prev, REQUISITION_IDS: '' }));
            }
        }
    };

    const handleRemoveRequisition = (requisitionId: string) => {
        // Remove requisition
        const newRequisitionIds = formData.REQUISITION_IDS.filter(id => id !== requisitionId);
        const newSelectedRequisitions = selectedRequisitions.filter(req => req.id.toString() !== requisitionId);

        // Remove items/services from this requisition
        const newItems = formData.ITEMS.filter(item => item.req_id !== parseInt(requisitionId));
        const newServices = formData.SERVICES.filter(service => service.req_id !== parseInt(requisitionId));

        setFormData(prev => ({
            ...prev,
            REQUISITION_IDS: newRequisitionIds,
            ITEMS: newItems,
            SERVICES: newServices
        }));

        setSelectedRequisitions(newSelectedRequisitions);
    };

    const handleSupplierChange = (supplierId: string) => {
        const vendor = vendors.find(v => v.id.toString() === supplierId) || null;

        setSelectedSupplier(vendor); // null if deselecting

        setFormData(prev => ({
            ...prev,
            SUPPLIER_ID: supplierId || '',
            PAYMENT_TYPE: vendor
                ? (vendor.allows_cash && prev.PAYMENT_TYPE === 'Cash'
                    ? 'Cash'
                    : vendor.allows_disbursement && prev.PAYMENT_TYPE === 'Disbursement'
                        ? 'Disbursement'
                        : vendor.allows_store_credit && prev.PAYMENT_TYPE === 'Store Credit'
                            ? 'Store Credit'
                            : '')
                : '',
        }));

        if (errors.SUPPLIER_ID) {
            setErrors(prev => ({ ...prev, SUPPLIER_ID: '' }));
        }
    };

    const toggleItemSelection = (itemId: number) => {
        if (formData.ITEMS.find(i => i.id === itemId)) {
            setFormData(prev => ({
                ...prev,
                ITEMS: prev.ITEMS.filter(item => item.id !== itemId)
            }));
        }
        else {
            const item = requisitionItems.find(ri => ri.id === itemId);
            if (!item) return;
            setFormData(prev => ({
                ...prev,
                ITEMS: [...prev.ITEMS, item]
            }));
        }
    };

    const toggleServiceSelection = (serviceId: number) => {
        if (formData.SERVICES.find(s => s.id === serviceId)) {
            setFormData(prev => ({
                ...prev,
                SERVICES: prev.SERVICES.filter(service => service.id !== serviceId)
            }));
        }
        else {
            const service = requisitionServices.find(rs => rs.id === serviceId);
            if (!service) return;
            setFormData(prev => ({
                ...prev,
                SERVICES: [...prev.SERVICES, service]
            }));
        }
    };

    const updateItemQuantity = (itemId: number, quantity: number) => {
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
                item.id === itemId
                    ? { ...item, quantity: quantity }
                    : item
            )
        }));
    };

    const calculateTotal = () => {
        const itemsTotal = formData.ITEMS
            .reduce((total: number, item: RequisitionItem) => total + (item.quantity * item.item.unit_price), 0);

        const servicesTotal = formData.SERVICES
            .reduce((total: number, service: RequisitionService) => total + (parseFloat(String(service.service.hourly_rate))), 0);

        return itemsTotal + servicesTotal;
    };

    const getSelectedItems = () => {
        return formData.ITEMS;
    };

    const getSelectedServices = () => {
        return formData.SERVICES;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setShowPreview(true);
        }
    };

    const handleConfirmSubmit = () => {
        const selectedItems = getSelectedItems();
        const selectedServices = getSelectedServices();
        const totalCost = calculateTotal();

        const purchaseOrderData = {
            REFERENCE_NO: formData.REFERENCE_NO,
            REQUISITION_IDS: formData.REQUISITION_IDS.map(id => parseInt(id)),
            SUPPLIER_ID: parseInt(formData.SUPPLIER_ID),
            PAYMENT_TYPE: formData.PAYMENT_TYPE,
            ORDER_TYPE: formData.ORDER_TYPE,
            TOTAL_COST: totalCost,
            STATUS: isEditMode ? currentPurchase?.status : 'Pending',
            REMARKS: formData.REMARKS,
            CREATED_AT: isEditMode ? currentPurchase?.created_at : new Date().toISOString(),
            ITEMS: formData.ITEMS.map(item => ({
                REQ_ITEM_ID: item.id,
                ITEM_ID: item.item_id,
                QUANTITY: item.quantity,
            })),
            SERVICES: formData.SERVICES.map(service => ({
                REQ_SERVICE_ID: service.id,
                SERVICE_ID: service.service_id,
            }))
        };

        router.post(orderpost().url, purchaseOrderData, {
            onSuccess: () => {
                alert('Purchase order added successfully!');
                setShowPreview(false);
                router.visit('/purchases');
            },
            onError: (error: any) => {
                console.log(error);
            }
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleReset = () => {
        if (isEditMode && currentPurchase) {
            // Reset to original values in edit mode
            setFormData({
                REFERENCE_NO: currentPurchase.ref_no,
                REQUISITION_IDS: orderToReqIds(currentPurchase),
                SUPPLIER_ID: currentPurchase.vendor_id?.toString() || '',
                PAYMENT_TYPE: currentPurchase.payment_type,
                REMARKS: currentPurchase.remarks || '',
                ORDER_TYPE: currentPurchase.type || '',
                ITEMS: orderToReqItems(currentPurchase) || [],
                SERVICES: orderToReqServices(currentPurchase) || []
            });
        } else {
            setFormData({
                REFERENCE_NO: '',
                REQUISITION_IDS: [],
                SUPPLIER_ID: '',
                PAYMENT_TYPE: 'Cash',
                REMARKS: '',
                ORDER_TYPE: '',
                ITEMS: [],
                SERVICES: []
            });
            generateReferenceNumber();
        }
        setErrors({});
        setSelectedSupplier(null);
        setSelectedRequisitions([]);
        setOriginalQuantities({});
        setSuggestedSuppliers([]); // Clear suggestions on reset
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit('/purchases');
        }
    };

    // Update breadcrumbs based on mode
    const updatedBreadcrumbs = isEditMode
        ? [
            ...breadcrumbs.slice(0, -1),
            { title: 'Edit Purchase Order', href: `/purchases/${purchaseId}/edit` }
        ]
        : breadcrumbs;

    useEffect(() => {
        setVendorIsInvalid(
            !!formData.SUPPLIER_ID && (suggestedSuppliers.find(s => s.vendor.id === parseInt(formData.SUPPLIER_ID))?.matchPercentage !== 100)
        );
    }, [formData.SUPPLIER_ID, suggestedSuppliers]);

    return (
        <AppLayout breadcrumbs={updatedBreadcrumbs}>
            <Head title={isEditMode ? "Edit Purchase Order" : "Create Purchase Order"} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {JSON.stringify(formData, null, 2)}
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {isEditMode
                                ? `Editing ${currentPurchase?.ref_no}`
                                : 'Create a new purchase order from approved requisitions'
                            }
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
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {isEditMode
                                            ? `Update purchase order ${currentPurchase?.ref_no}`
                                            : 'Select order type, approved requisitions and vendor to create a purchase order'
                                        }
                                    </p>
                                    {!isEditMode && formData.REQUISITION_IDS.length > 1 && (
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
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                        {/* Left Column - Order Info & Supplier Selection */}
                                        <div className="xl:col-span-1 space-y-6">
                                            <OrderInfo
                                                formData={formData}
                                                selectedSupplier={selectedSupplier}
                                                errors={errors}
                                                onInputChange={handleInputChange}
                                                isEditMode={isEditMode}
                                                onOrderTypeChange={handleOrderTypeChange}
                                            />

                                            <SelectSupplier
                                                formData={formData}
                                                selectedSupplier={selectedSupplier}
                                                suggestedSuppliers={suggestedSuppliers}
                                                suppliersData={vendors}
                                                errors={errors}
                                                onSupplierChange={handleSupplierChange}
                                                categories={categories}
                                                vendorCategories={vendorCategories}
                                            />
                                        </div>

                                        {/* Right Column - Requisition, Items/Services, and Additional Info */}
                                        <div className="xl:col-span-2 space-y-6 h-full">
                                            {/* Approved Requisitions Selection */}
                                            <SelectApprovedRequisition
                                                formData={formData}
                                                selectedRequisitions={selectedRequisitions}
                                                approvedRequisitions={approvedRequisitions}
                                                errors={errors}
                                                onRequisitionSelect={handleRequisitionSelect}
                                                onRequisitionRemove={handleRemoveRequisition}
                                                isEditMode={isEditMode}
                                                requisitionItems={requisitionItems}
                                                requisitionServices={requisitionServices}
                                                categories={categories}
                                            />

                                            {/* Conditionally render Items   or Services based on order type */}
                                            {formData.ORDER_TYPE === 'Items' && (
                                                <OrderItems
                                                    formData={formData}
                                                    selectedRequisition={selectedRequisitions}
                                                    originalQuantities={originalQuantities}
                                                    errors={errors}
                                                    onToggleItemSelection={toggleItemSelection}
                                                    onUpdateItemQuantity={updateItemQuantity}
                                                    requisitionItems={requisitionItems}
                                                    categories={categories}
                                                    requisitionOrderItems={requisitionOrderItems}
                                                />
                                            )}

                                            {formData.ORDER_TYPE === 'Services' && (
                                                <OrderService
                                                    formData={formData}
                                                    selectedRequisition={selectedRequisitions}
                                                    originalQuantities={originalQuantities}
                                                    errors={errors}
                                                    onToggleServiceSelection={toggleServiceSelection}
                                                    requisitionServices={requisitionServices}
                                                    categories={categories}
                                                    requisitionOrderServices={requisitionOrderServices}
                                                />
                                            )}

                                            {/*/!* Selected Supplier Display *!/*/}
                                            {/*{selectedSupplier && (*/}
                                            {/*    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">*/}
                                            {/*        <div className="flex items-center justify-between mb-3">*/}
                                            {/*            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">*/}
                                            {/*                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">*/}
                                            {/*                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />*/}
                                            {/*                </svg>*/}
                                            {/*                Selected Vendor*/}
                                            {/*            </h3>*/}
                                            {/*            <button*/}
                                            {/*                type="button"*/}
                                            {/*                onClick={() => handleSupplierChange('')}*/}
                                            {/*                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"*/}
                                            {/*            >*/}
                                            {/*                <X size={18}/>*/}
                                            {/*            </button>*/}
                                            {/*        </div>*/}
                                            {/*        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
                                            {/*            <div>*/}
                                            {/*                <p className="font-bold text-lg text-blue-800 dark:text-blue-200">{selectedSupplier.name}</p>*/}
                                            {/*                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">*/}
                                            {/*                    <strong>Email:</strong> {selectedSupplier.email}*/}
                                            {/*                </p>*/}
                                            {/*                <p className="text-sm text-blue-700 dark:text-blue-300">*/}
                                            {/*                    <strong>Phone:</strong> {selectedSupplier.contact_number ?? 'N/A'}*/}
                                            {/*                </p>*/}
                                            {/*            </div>*/}
                                            {/*            <div>*/}
                                            {/*                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Payment Methods:</p>*/}
                                            {/*                <div className="flex flex-wrap gap-1">*/}
                                            {/*                    {selectedSupplier.allows_cash && (*/}
                                            {/*                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">*/}
                                            {/*                            Cash*/}
                                            {/*                        </span>*/}
                                            {/*                    )}*/}
                                            {/*                    {selectedSupplier.allows_disbursement && (*/}
                                            {/*                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">*/}
                                            {/*                            Disbursement*/}
                                            {/*                        </span>*/}
                                            {/*                    )}*/}
                                            {/*                    {selectedSupplier.allows_store_credit && (*/}
                                            {/*                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">*/}
                                            {/*                            Store Credit*/}
                                            {/*                        </span>*/}
                                            {/*                    )}*/}
                                            {/*                </div>*/}
                                            {/*            </div>*/}
                                            {/*        </div>*/}
                                            {/*    </div>*/}
                                            {/*)}*/}

                                            <AdditionalInfo
                                                formData={formData}
                                                onInputChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    { vendorIsInvalid && (
                                        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <svg className="w-8 h-8 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                <p className="text-red-700 dark:text-red-300 text-sm">
                                                    Selected vendor cannot provide all selected items based on their available categories (
                                                    {
                                                        suggestedSuppliers.find(s => s.vendor.id === parseInt(formData.SUPPLIER_ID))?.matchPercentage
                                                            ? `only ${suggestedSuppliers.find(s => s.vendor.id === parseInt(formData.SUPPLIER_ID))?.matchPercentage}% of`
                                                            : 'no'
                                                    } items match)
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3 justify-between">
                                            <div className="flex gap-3">
                                                {/* Reset Button */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleReset}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                        {isEditMode ? 'Reset Changes' : 'Reset Form'}
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>

                                                {/* Cancel Button */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                        Cancel
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={approvedRequisitions.length === 0 && !isEditMode}
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isEditMode
                                                    ? 'Update Purchase Order'
                                                    : 'Create Purchase Order'
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
                    isEditMode={isEditMode}
                    categories={categories}
                />
            )}
        </AppLayout>
    );
}
