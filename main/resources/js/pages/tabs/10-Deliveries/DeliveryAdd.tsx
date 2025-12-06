import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {Head, Link, router, usePage} from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from './utils';

// Define delivery types
export const DELIVERY_TYPES = {
    ITEM_PURCHASE: 'Item Purchase',
    SERVICE_DELIVERY: 'Service Delivery',
    ITEM_RETURN: 'Item Return',
    SERVICE_REWORK: 'Service Rework'
};

// Import the new datasets
import returns from '../../datasets/returns';
import returnItems from '../../datasets/return_items';
import reworks from '../../datasets/reworks';
import {deliverypost, orderpost} from "@/routes";
import {purchaseOrdersData} from "@/pages/datasets/purchase_order";

// Type definitions
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

export interface Service {
    id: number;
    name: string;
    description: string;
    hourly_rate: number;
    is_active: boolean;
    category_id: number;
    vendor_id: number | null;
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

export interface PurchaseOrder {
    id: number;
    ref_no: string;
    type: string;          // from PurchaseOrder::TYPES
    created_at: string;    // ISO timestamp
    total_cost: number;
    payment_type: string;  // from PurchaseOrder::PAYMENT_TYPE
    status: string;        // from PurchaseOrder::status
    remarks: string | null;
    vendor_id: number | null;
    vendor: Vendor | null;
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

export interface Delivery {
    id: number;
    ref_no: string;
    type: string;
    delivery_date: string;
    total_cost: number;
    receipt_no: string;
    receipt_photo: string | null;
    status: string;
    remarks: string | null;
    po_id: number | null;
}

export interface Return {
    id: number;
    ref_no: string;
    created_at: string;    // ISO timestamp
    return_date: string;   // ISO date
    status: string;        // from Returns::status
    remarks: string | null;
    delivery_id: number | null;
    originalDelivery: Delivery | null;
}

export interface ReturnItem {
    id: number;
    return_id: number;
    item_id: number;
    item: Item;
    quantity: number;
}

export interface Rework {
    id: number;
    ref_no: string;
    created_at: string;    // ISO timestamp
    status: string;        // from Rework::status
    remarks: string;
    originalDelivery: Delivery | null;
}

export interface ReworkService {
    id: number;
    rework_id: number;
    service_id: number;
    service: Service;
    item_id: number | null;
    item: Item | null;
}


interface FormItem {
    item_id: number;
    quantity: number;
    ordered_qty: number;
    unit_price: number;
    original_unit_price: number;
}

interface FormService {
    service_id: number;
    hourly_rate: number;
    original_hourly_rate: number;
    hours: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Deliveries',
        href: '/deliveries',
    },
    {
        title: 'Add Delivery',
        href: '/deliveries/add',
    },
];

type DeliveryForm = {
    REFERENCE_NO: string;
    DELIVERY_TYPE: string;
    PO_ID: string;
    RETURN_ID: string;
    REWORK_ID: string;
    RECEIPT_NO: string;
    DELIVERY_DATE: string;
    REMARKS: string;
    STATUS: string;
    RECEIPT_PHOTO: string | null; // <-- allow string or null
};

export default function DeliveryAdd({ auth }: { auth: any }) {
    const { purchaseOrders: backendPurchaseOrders, returns, reworks, orderItems, orderServices, returnItems, reworkService: reworkServices, types, statuses, items, services, vendors, deliveries } = usePage<{
        purchaseOrders: PurchaseOrder[];
        returns: Return[];
        reworks: Rework[];
        orderItems: OrderItem[];
        orderServices: OrderService[];
        returnItems: ReturnItem[];
        reworkService: ReworkService[];
        types: string[];
        statuses: string[];
        items: Item[];
        services: Service[];
        vendors: Vendor[];
        deliveries: Delivery[];
    }>().props;
    const [formData, setFormData] = useState<DeliveryForm>({
        REFERENCE_NO: '',
        DELIVERY_TYPE: '',
        PO_ID: '',
        RETURN_ID: '',
        REWORK_ID: '',
        RECEIPT_NO: '',
        DELIVERY_DATE: '',
        REMARKS: '',
        STATUS: 'Pending',
        RECEIPT_PHOTO: null,
    });
    const [selectedItems, setSelectedItems] = useState<FormItem[]>([]);
    const [selectedServices, setSelectedServices] = useState<FormService[]>([]);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(backendPurchaseOrders);
    const [availableReturns, setAvailableReturns] = useState<Return[]>([]);
    const [availableReworks, setAvailableReworks] = useState<Rework[]>([]);

    // Auto-calculate total cost whenever selected items/services change
    useEffect(() => {
        // This effect will automatically update the total cost display
        // The total is now calculated on-demand in calculateTotalCost()
    }, [selectedItems, selectedServices]);

    // Load data on component mount
    useEffect(() => {
        loadPurchaseOrders();
        loadReturns();
        loadReworks();
    }, []);

    const loadPurchaseOrders = () => {
        setPurchaseOrders(purchaseOrders);
    };
    const loadReturns = () => {
        setAvailableReturns(returns);
    };

    const loadReworks = () => {
        setAvailableReworks(reworks);
    };

    const handleReceiptPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({ ...prev, RECEIPT_PHOTO: e.target?.result as string }));
                // Clear receipt photo error if any
                if (errors.RECEIPT_PHOTO) {
                    setErrors(prev => ({ ...prev, RECEIPT_PHOTO: '' }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Calculate total cost from selected items and services
    const calculateTotalCost = () => {
        if (selectedItems.length > 0) {
            return selectedItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
        }
        if (selectedServices.length > 0) {
            return selectedServices.reduce((total, service) => total + (service.hours * service.hourly_rate), 0);
        }
        return 0;
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.DELIVERY_TYPE) {
            newErrors.DELIVERY_TYPE = 'Delivery type is required';
        }

        if (formData.DELIVERY_TYPE === 'Item Purchase' || formData.DELIVERY_TYPE === 'Service Delivery') {
            if (!formData.PO_ID) {
                newErrors.PO_ID = 'Purchase order is required';
            }
        }

        if (formData.DELIVERY_TYPE === 'Item Return') {
            if (!formData.RETURN_ID) {
                newErrors.RETURN_ID = 'Return is required';
            }
        }

        if (formData.DELIVERY_TYPE === 'Service Rework') {
            if (!formData.REWORK_ID) {
                newErrors.REWORK_ID = 'Rework is required';
            }
        }

        if (!formData.RECEIPT_NO) {
            newErrors.RECEIPT_NO = 'Receipt number is required';
        }

        if (selectedItems.length === 0 && selectedServices.length === 0) {
            newErrors.items = 'At least one item or service must be selected for delivery';
        }

        if (!formData.DELIVERY_DATE) {
            newErrors.DELIVERY_DATE = 'Delivery date is required';
        }

        selectedItems.forEach((item, index) => {
            if (item.quantity <= 0) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDeliveryTypeChange = (deliveryType: string) => {
        setFormData(prev => ({
            ...prev,
            DELIVERY_TYPE: deliveryType,
            PO_ID: '',
            RETURN_ID: '',
            REWORK_ID: ''
        }));
        setSelectedItems([]);
        setSelectedServices([]);

        if (errors.DELIVERY_TYPE) {
            setErrors(prev => ({ ...prev, DELIVERY_TYPE: '' }));
        }
    };

    const handlePurchaseOrderChange = (poId: string) => {
        setFormData(prev => ({ ...prev, PO_ID: poId }));
        setSelectedItems([]);
        setSelectedServices([]);

        if (errors.PO_ID) {
            setErrors(prev => ({ ...prev, PO_ID: '' }));
        }
    };

    const handleReturnChange = (returnId: string) => {
        setFormData(prev => ({ ...prev, RETURN_ID: returnId }));
        setSelectedItems([]);

        // Load return items when return is selected
        if (returnId) {
            loadReturnItems(parseInt(returnId));
        }
    };

    const handleReworkChange = (reworkId: string) => {
        setFormData(prev => ({ ...prev, REWORK_ID: reworkId }));
        setSelectedServices([]);

        // Load rework services when rework is selected
        if (reworkId) {
            loadReworkServices(parseInt(reworkId));
        }
    };

    const loadReturnItems = (returnId: number) => {
        const itemReturn = availableReturns.find(r => r.id === returnId);
        const items = returnItems.filter((ri: ReturnItem) => ri.return_id === returnId);
        if (itemReturn && items) {
            const itemsWithDetails = items.map(item => ({
                item_id: item.item_id,
                item_name: item.item.name,
                quantity: item.quantity,
                unit_price: item.item.unit_price, // Returns typically don't have unit price
                max_quantity: item.quantity
            }));
            setSelectedItems([]); // setSelectedItems(itemsWithDetails);
        }
    };

    const loadReworkServices = (reworkId: number) => {
        const rework = availableReworks.find(r => r.id === reworkId);
        const services = reworkServices.filter(rs => rs.rework_id === reworkId);
        if (rework && services) {
            const servicesWithDetails = services.map((service: ReworkService) => ({
                service_id: service.service_id,
                service_name: service.service.name,
                description: service.service.description,
                hourly_rate: service.service.hourly_rate,
                item_id: service.item_id ? service.item_id : null,
            }));
            setSelectedServices([]); // setSelectedServices(servicesWithDetails);
        }
    };

    const handleAddItem = (item: any) => {
        setSelectedItems(prev => [...prev, {
            item_id: item.ITEM_ID,
            quantity: item.QUANTITY_ORDERED,
            ordered_qty: item.QUANTITY_ORDERED,
            unit_price: parseFloat(item.UNIT_PRICE),
            original_unit_price: parseFloat(item.UNIT_PRICE),
        }]);
    };

    const handleAddService = (service: any) => {
        setSelectedServices(prev => [...prev, {
            service_id: service.service_id,
            hourly_rate: parseFloat(service.service.hourly_rate),
            original_hourly_rate: parseFloat(service.service.hourly_rate),
            hours: 1,
        }]);
    };

    const handleRemoveItem = (itemId: number) => {
        setSelectedItems(prev => prev.filter(item => item.item_id !== itemId));
    };

    const handleRemoveService = (serviceId: number) => {
        setSelectedServices(prev => prev.filter(service => service.service_id !== serviceId));
    };

    const handleItemQuantityChange = (itemId: number, quantity: number) => {
        setSelectedItems(prev => prev.map(item =>
            item.item_id === itemId ? {
                ...item,
                quantity: Math.max(1, quantity)
            } : item
        ));
    };

    const handleItemUnitPriceChange = (itemId: number, unitPrice: number) => {
        setSelectedItems(prev => prev.map(item =>
            item.item_id === itemId ? {
                ...item,
                unit_price: Math.max(0, unitPrice)
            } : item
        ));
    };

    const handleServiceQuantityChange = (serviceId: number, hours: number) => {
        setSelectedServices(prev => prev.map(service =>
            service.service_id === serviceId ? {
                ...service,
                hours: Math.max(1, hours)
            } : service
        ));
    };

    const handleServiceRateChange = (serviceId: number, hourlyRate: number) => {
        setSelectedServices(prev => prev.map(service =>
            service.service_id === serviceId ? {
                ...service,
                hourly_rate: Math.max(0, hourlyRate)
            } : service
        ));
    };

    const getSelectedPurchaseOrder = () => {
        return purchaseOrders.find(po => po.id.toString() === formData.PO_ID);
    };

    const getSelectedReturn = () => {
        return availableReturns.find(ret => ret.id.toString() === formData.RETURN_ID);
    };

    const getSelectedRework = () => {
        return availableReworks.find(rework => rework.id.toString() === formData.REWORK_ID);
    };

    const getPurchaseOrderItems = (poId: number) => {
        const poItems = orderItems.filter(po => po.po_id === poId);
        if (!poItems) return [];

        return poItems.map(item => {
            // Use ITEM_ID to find the item in itemsData
            const itemData = items.find(i => i.id === item.item_id);
            return {
                ID: item.id,
                ITEM_ID: item.item_id,
                ITEM_NAME: itemData?.name || 'Unknown Item',
                QUANTITY_ORDERED: item.quantity,
                UNIT_PRICE: itemData?.unit_price,
                BARCODE: itemData?.barcode || '',
                CATEGORY: itemData?.category_id || 0
            };
        });
    };

    const getAvailableItems = () => {
        if (!formData.PO_ID) return [];
        const poId = parseInt(formData.PO_ID);
        return getPurchaseOrderItems(poId);
    };

    const getAvailableServices = () => {
        if (!formData.PO_ID) return [];
        const poId = parseInt(formData.PO_ID);
        return orderServices.filter(s => s.po_id === poId);
    };

    const getFilteredPurchaseOrders = () => {
        if (formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE) {
            return purchaseOrders.filter(po => po.type === 'Items');
        } else if (formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY) {
            return purchaseOrders.filter(po => po.type === 'Services');
        }
        return [];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const calculatedTotalCost = calculateTotalCost();
            let refNo = formData.REFERENCE_NO;
            if (!refNo) {
                let unique = false;
                while (!unique) {
                    const random = Math.floor(100000 + Math.random() * 900000);
                    refNo = `DEL-${random}`;
                    const exists = deliveries.some(d => d.ref_no === refNo);
                    if (!exists) unique = true;
                }
            }

            const deliveryData = {
                ref_no: refNo,
                delivery_type: formData.DELIVERY_TYPE,
                delivery_date: formData.DELIVERY_DATE,
                total_cost: calculatedTotalCost,
                receipt_no: formData.RECEIPT_NO,
                receipt_photo: formData.RECEIPT_PHOTO,
                status: formData.STATUS,
                remarks: formData.REMARKS,
                po_id: formData.PO_ID ? parseInt(formData.PO_ID) : null,
                return_id: formData.RETURN_ID ? parseInt(formData.RETURN_ID) : null,
                rework_id: formData.REWORK_ID ? parseInt(formData.REWORK_ID) : null,
                items: selectedItems.map(item => ({
                    item_id: item.item_id,
                    quantity: item.quantity,
                    ordered_qty: item.ordered_qty,
                    unit_price: item.unit_price,
                    original_unit_price: item.original_unit_price,
                })),
                services: selectedServices.map(service => ({
                    service_id: service.service_id,
                    hourly_rate: service.hourly_rate,
                    original_hourly_rate: service.original_hourly_rate,
                    hours: service.hours,
                }))
            };

            router.post(deliverypost().url, deliveryData, {
                onSuccess: () => {
                    alert('Delivery added successfully!');
                    router.visit('/deliveries');
                },
                onError: (error: any) => {
                    console.log(error);
                }
            });
        }
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
        setFormData({
            REFERENCE_NO: '',
            DELIVERY_TYPE: '',
            PO_ID: '',
            RETURN_ID: '',
            REWORK_ID: '',
            RECEIPT_NO: '',
            DELIVERY_DATE: '',
            REMARKS: '',
            STATUS: 'Pending',
            RECEIPT_PHOTO: null
        });
        setSelectedItems([]);
        setSelectedServices([]);
        setErrors({});
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit('/deliveries');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Delivery" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Delivery</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Create a new delivery record
                        </p>
                    </div>
                    <Link
                        href="/deliveries"
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return Back
                    </Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">

                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Delivery Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the details below to create a new delivery
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6">
                                    <div className="space-y-8">
                                        {/* Basic Information */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                Basic Information
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Delivery Type <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.DELIVERY_TYPE}
                                                        onChange={(e) => handleDeliveryTypeChange(e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.DELIVERY_TYPE ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    >
                                                        <option value="">Select delivery type</option>
                                                        {types.map(type => (
                                                            <option value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                    {errors.DELIVERY_TYPE && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.DELIVERY_TYPE}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Receipt Number <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.RECEIPT_NO}
                                                        onChange={(e) => handleInputChange('RECEIPT_NO', e.target.value)}
                                                        placeholder="Enter receipt number"
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.RECEIPT_NO ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    />
                                                    {errors.RECEIPT_NO && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.RECEIPT_NO}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Delivery Date <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={formData.DELIVERY_DATE}
                                                        onChange={(e) => handleInputChange('DELIVERY_DATE', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.DELIVERY_DATE ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    />
                                                    {errors.DELIVERY_DATE && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.DELIVERY_DATE}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Total Cost
                                                    </label>
                                                    <div className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white font-mono">
                                                        {formatCurrency(calculateTotalCost())}
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Automatically calculated from selected items/services
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Source Selection based on Delivery Type */}
                                            {formData.DELIVERY_TYPE && (
                                                <div>
                                                    {formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Purchase Order (Items) <span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                required
                                                                value={formData.PO_ID}
                                                                onChange={(e) => handlePurchaseOrderChange(e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                    errors.PO_ID ? 'border-red-500' : 'border-sidebar-border'
                                                                }`}
                                                            >
                                                                <option value="">Select a purchase order</option>
                                                                {getFilteredPurchaseOrders().map(po => (
                                                                    <option key={po.id} value={po.id}>
                                                                        {po.ref_no} - Vendor: {po.vendor?.name} - {po.remarks ?? 'No remarks'} - {formatCurrency(po.total_cost)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors.PO_ID && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.PO_ID}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Purchase Order (Services) <span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                required
                                                                value={formData.PO_ID}
                                                                onChange={(e) => handlePurchaseOrderChange(e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                    errors.PO_ID ? 'border-red-500' : 'border-sidebar-border'
                                                                }`}
                                                            >
                                                                <option value="">Select a purchase order</option>
                                                                {getFilteredPurchaseOrders().map(po => (
                                                                    <option key={po.id} value={po.id}>
                                                                        {po.ref_no} - Vendor: {po.vendor?.name} - {po.remarks ?? 'No remarks'} - {formatCurrency(po.total_cost)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors.PO_ID && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.PO_ID}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_RETURN && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Select Return <span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                required
                                                                value={formData.RETURN_ID}
                                                                onChange={(e) => handleReturnChange(e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                    errors.RETURN_ID ? 'border-red-500' : 'border-sidebar-border'
                                                                }`}
                                                            >
                                                                <option value="">Select a return</option>
                                                                {availableReturns.map(ret => (
                                                                    <option key={ret.id} value={ret.id}>
                                                                        {ret.ref_no} - Vendor: {vendors.find(v =>
                                                                            v.id === purchaseOrders.find(po =>
                                                                                po.id === ret.originalDelivery?.po_id
                                                                            )?.vendor_id)?.name} - {ret.remarks ?? 'No remarks'}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors.RETURN_ID && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.RETURN_ID}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_REWORK && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Select Rework <span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                required
                                                                value={formData.REWORK_ID}
                                                                onChange={(e) => handleReworkChange(e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                    errors.REWORK_ID ? 'border-red-500' : 'border-sidebar-border'
                                                                }`}
                                                            >
                                                                <option value="">Select a rework</option>
                                                                {availableReworks.map(rework => (
                                                                    <option key={rework.id} value={rework.id}>
                                                                        {rework.ref_no} - Vendor: {vendors.find(v =>
                                                                        v.id === purchaseOrders.find(po =>
                                                                            po.id === rework.originalDelivery?.po_id
                                                                        )?.vendor_id)?.name} - {rework.remarks ?? 'No remarks'}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors.REWORK_ID && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.REWORK_ID}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Source Information Display */}
                                            {formData.PO_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Purchase Order Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Vendor:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedPurchaseOrder()?.vendor?.name || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Order Date:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedPurchaseOrder()?.created_at ? formatDate(getSelectedPurchaseOrder()!.created_at) : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Payment Type:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedPurchaseOrder()?.payment_type}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {formData.RETURN_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Return Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Reference No:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedReturn()?.ref_no}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Return Date:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedReturn()?.return_date ? formatDate(getSelectedReturn()!.return_date) : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Remarks:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedReturn()?.remarks}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {formData.REWORK_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Rework Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Reference No:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedRework()?.ref_no}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Request Date:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedRework()?.created_at ? formatDate(getSelectedRework()!.created_at) : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Remarks:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedRework()?.remarks}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Items Selection */}
                                            {(formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE || formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_RETURN) && (
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            Delivery Items
                                                        </h3>
                                                        {formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE && formData.PO_ID && (
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {getAvailableItems().length} items available from PO
                                                        </span>
                                                        )}
                                                    </div>

                                                    {errors.items && (
                                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
                                                        </div>
                                                    )}

                                                    {/* Available Items from Purchase Order */}
                                                    {formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE && formData.PO_ID && (
                                                        <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                                Available Items from Purchase Order
                                                            </h4>
                                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                                {getAvailableItems().map(item => (
                                                                    <div key={item.ITEM_ID} className="flex justify-between items-center p-3 bg-white dark:bg-sidebar rounded border border-sidebar-border">
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.ITEM_NAME}</p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                Ordered: {item.QUANTITY_ORDERED} • Unit Price: {formatCurrency(item.UNIT_PRICE ?? 0)}
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAddItem(item)}
                                                                            disabled={selectedItems.some(selected => selected.item_id === item.ITEM_ID)}
                                                                            className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                        >
                                                                            Add
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Selected Items */}
                                                    {selectedItems.length > 0 && (
                                                        <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                                                            <div className="bg-gray-50 dark:bg-sidebar-accent px-4 py-3 border-b border-sidebar-border">
                                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    Selected Items ({selectedItems.length})
                                                                </h4>
                                                            </div>
                                                            <div className="divide-y divide-sidebar-border">
                                                                {selectedItems.map((item, index) => (
                                                                    <div key={item.item_id} className="p-4">
                                                                        <div className="flex justify-between items-start mb-3">
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{items.find(i => i.id === item.item_id)?.name || 'Unknown Item'}</p>
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                    Barcode: {items.find(i => i.id === item.item_id)?.barcode ?? 'No barcode data'}
                                                                                </p>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveItem(item.item_id)}
                                                                                className="text-red-600 hover:text-red-700 p-1"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Quantity <span className="text-red-500">*</span>
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    placeholder={String(item.ordered_qty)}
                                                                                    onChange={(e) => handleItemQuantityChange(item.item_id, parseInt(e.target.value) || item.ordered_qty)}
                                                                                    className={`w-full px-3 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                                        errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-sidebar-border'
                                                                                    }`}
                                                                                />
                                                                                {errors[`item_${index}_quantity`] && (
                                                                                    <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                                                                                )}
                                                                                {formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE && (
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                        Ordered: {item.ordered_qty}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Unit Price <span className="text-red-500">*</span>
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    placeholder={item.original_unit_price.toFixed(2)}
                                                                                    onChange={(e) => handleItemUnitPriceChange(item.item_id, parseFloat(e.target.value) || item.original_unit_price)}
                                                                                    className={`w-full px-3 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                                        errors[`item_${index}_unit_price`] ? 'border-red-500' : 'border-sidebar-border'
                                                                                    }`}
                                                                                />
                                                                                {errors[`item_${index}_quantity`] && (
                                                                                    <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_unit_price`]}</p>
                                                                                )}
                                                                                {formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE && (
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                        Latest record: {formatCurrency(item.original_unit_price)}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Services Selection */}
                                            {(formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY || formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_REWORK) && (
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            Delivery Services
                                                        </h3>
                                                        {formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY && formData.PO_ID && (
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {getAvailableServices().length} services available from PO
                                                        </span>
                                                        )}
                                                    </div>

                                                    {errors.items && (
                                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
                                                        </div>
                                                    )}

                                                    {/* Available Services from Purchase Order */}
                                                    {formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY && formData.PO_ID && (
                                                        <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                                Available Services from Purchase Order
                                                            </h4>
                                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                                {getAvailableServices().map((service) => (
                                                                    <div key={service.id} className="flex justify-between items-center p-3 bg-white dark:bg-sidebar rounded border border-sidebar-border">
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{service.service.name}</p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                {service.service.description}
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAddService(service)}
                                                                            disabled={selectedServices.some(selected => selected.service_id === service.id)}
                                                                            className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                        >
                                                                            Add
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Selected Services */}
                                                    {selectedServices.length > 0 && (
                                                        <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                                                            <div className="bg-gray-50 dark:bg-sidebar-accent px-4 py-3 border-b border-sidebar-border">
                                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    Selected Services ({selectedServices.length})
                                                                </h4>
                                                            </div>
                                                            <div className="divide-y divide-sidebar-border">
                                                                {selectedServices.map((service, index) => (
                                                                    <div key={service.service_id} className="p-4">
                                                                        <div className="flex justify-between items-start mb-3">
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{services.find(s => s.id === service.service_id)?.name || 'Unknown Service'}</p>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                    {services.find(s => s.id === service.service_id)?.description || 'No description'}
                                                                                </p>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveService(service.service_id)}
                                                                                className="text-red-600 hover:text-red-700 p-1"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Hours <span className="text-red-500">*</span>
                                                                                </label>
                                                                                <input
                                                                                    required
                                                                                    type="number"
                                                                                    min="1"
                                                                                    onChange={(e) => handleServiceQuantityChange(service.service_id, parseFloat(e.target.value) || 0)}
                                                                                    className={`w-full px-3 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                                        errors[`service_${index}_hours`] ? 'border-red-500' : 'border-sidebar-border'
                                                                                    }`}
                                                                                />
                                                                                {errors[`service_${index}_hours`] && (
                                                                                    <p className="text-red-500 text-xs mt-1">{errors[`service_${index}_hours`]}</p>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Hourly Rate <span className="text-red-500">*</span>
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    placeholder={service.original_hourly_rate.toFixed(2)}
                                                                                    onChange={(e) => handleServiceRateChange(service.service_id, parseFloat(e.target.value) || service.original_hourly_rate)}
                                                                                    className={`w-full px-3 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                                        errors[`service_${index}_hourly_rate`] ? 'border-red-500' : 'border-sidebar-border'
                                                                                    }`}
                                                                                />
                                                                                {errors[`service_${index}_hourly_rate`] && (
                                                                                    <p className="text-red-500 text-xs mt-1">{errors[`service_${index}_hourly_rate`]}</p>
                                                                                )}
                                                                                {formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY && (
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                        Latest record: {formatCurrency(service.original_hourly_rate)}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Receipt Photo
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleReceiptPhotoUpload}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.RECEIPT_PHOTO ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    />
                                                    {errors.RECEIPT_PHOTO && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.RECEIPT_PHOTO}</p>
                                                    )}
                                                    {formData.RECEIPT_PHOTO && (
                                                        <div className="mt-2">
                                                            <img
                                                                src={formData.RECEIPT_PHOTO}
                                                                alt="Receipt preview"
                                                                className="h-20 w-auto rounded border"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Status
                                                    </label>
                                                    <select
                                                        onChange={(e) => handleInputChange('STATUS', e.target.value)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                    >
                                                        {statuses.map(status => (
                                                            <option value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Total Summary */}
                                        {(selectedItems.length > 0 || selectedServices.length > 0) && (
                                            <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Delivery Value:</span>
                                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(calculateTotalCost())}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Remarks */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                Additional Information
                                            </h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Remarks
                                                </label>
                                                <textarea
                                                    value={formData.REMARKS}
                                                    onChange={(e) => handleInputChange('REMARKS', e.target.value)}
                                                    placeholder="Additional notes or comments about this delivery..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3 justify-between items-center">
                                            <div className="flex gap-3">
                                                {/* Reset Button - Circle with refresh icon and tooltip */}
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
                                                        Reset Form
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>

                                                {/* Cancel Button - Circle with X icon and tooltip */}
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

                                            <button
                                                type="submit"
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Create Delivery
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
