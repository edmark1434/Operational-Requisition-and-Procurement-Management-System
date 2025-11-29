import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {Head, Link, router, usePage} from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { getAvailablePurchaseOrders, getPurchaseOrderItems, formatCurrency, formatDate } from './utils';

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

export interface PurchaseOrder {
    id: number;
    ref_no: string;
    type: string;          // from PurchaseOrder::TYPES
    created_at: string;    // ISO timestamp
    total_cost: number;
    payment_type: string;  // from PurchaseOrder::PAYMENT_TYPE
    status: string;        // from PurchaseOrder::status
    remarks: string | null;
    req_id: number | null;
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

export interface Return {
    id: number;
    created_at: string;    // ISO timestamp
    return_date: string;   // ISO date
    status: string;        // from Returns::status
    remarks: string | null;
    delivery_id: number | null;
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
    created_at: string;    // ISO timestamp
    status: string;        // from Rework::status
    remarks: string;
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
    unit_price: number;
}

interface FormService {
    service_id: number;
    item_id: number | null;
    hourly_rate: number;
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

export default function DeliveryAdd({ auth }: { auth: any }) {
    const { purchaseOrders: backendPurchaseOrders, returns, reworks, orderItems, orderServices, returnItems, reworkService: reworkServices, types, statuses, items, services } = usePage<{
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
    }>().props;
    const [formData, setFormData] = useState({
        DELIVERY_TYPE: '',
        PO_ID: '',
        RETURN_ID: '',
        REWORK_ID: '',
        RECEIPT_NO: '',
        DELIVERY_DATE: '',
        REMARKS: '',
        STATUS: 'Pending',
        RECEIPT_PHOTO: ''
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
        return selectedItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
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

        // Add receipt photo validation
        if (!formData.RECEIPT_PHOTO) {
            newErrors.RECEIPT_PHOTO = 'Receipt photo is required';
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
            setSelectedItems(itemsWithDetails);
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
            setSelectedServices(servicesWithDetails);
        }
    };

    const handleAddItem = (item: any) => {
        const existingItem = selectedItems.find(selected => selected.item_id === item.item_id);

        if (!existingItem) {
            setSelectedItems(prev => [...prev, {
                item_id: item.item_id,
                quantity: item.quantity,
                unit_price: item.unit_price
            }]);
        }
    };

    const handleAddService = (service: any) => {
        const existingService = selectedServices.find(selected => selected.service_id === service.service_id);

        if (!existingService) {
            setSelectedServices(prev => [...prev, {
                service_id: service.service_id,
                item_id: service.item_id,
                hourly_rate: service.hourly_rate
            }]);
        }
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

    const handleServiceQuantityChange = (serviceId: number, quantity: number) => {
        setSelectedServices(prev => prev.map(service =>
            service.service_id === serviceId ? {
                ...service,
                quantity: Math.max(1, quantity)
            } : service
        ));
    };

    const getTotalValue = () => {
        return calculateTotalCost();
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

    const getAvailableItems = () => {
        if (!formData.PO_ID) return [];
        const poId = parseInt(formData.PO_ID);
        return getPurchaseOrderItems(poId);
    };

    const getAvailableServices = (): Service[] => {
        if (!formData.PO_ID) return [];
        const selectedPO = getSelectedPurchaseOrder();
        return orderServices.filter(s => s.po_id === selectedPO?.id).map(s => s.service);
    };

    const getFilteredPurchaseOrders = () => {
        if (formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE) {
            return purchaseOrders.filter(po =>
                po.type === 'items' &&
                (po.status === 'approved' || po.status === 'completed')
            );
        } else if (formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY) {
            return purchaseOrders.filter(po =>
                po.type === 'services' &&
                (po.status === 'approved' || po.status === 'completed')
            );
        }
        return [];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const calculatedTotalCost = calculateTotalCost();

            const deliveryData = {
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
                    unit_price: item.unit_price
                })),
                services: selectedServices.map(service => ({
                    service_id: service.service_id,
                    hourly_rate: service.hourly_rate,
                }))
            };

            console.log('New Delivery Data:', deliveryData);
            alert('Delivery created successfully!');
            router.visit('/deliveries');
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
            DELIVERY_TYPE: '',
            PO_ID: '',
            RETURN_ID: '',
            REWORK_ID: '',
            RECEIPT_NO: '',
            DELIVERY_DATE: '',
            REMARKS: '',
            STATUS: 'Pending',
            RECEIPT_PHOTO: ''
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

                                <form onSubmit={handleSubmit} className="p-6">
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
                                                                        {po.ref_no} - Vendor ID: {po.vendor_id} - {formatCurrency(po.total_cost)}
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
                                                                        {po.ref_no} - Vendor ID: {po.vendor_id} - {formatCurrency(po.total_cost)}
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
                                                                        Return #{ret.id} - {formatDate(ret.created_at)}
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
                                                                        Rework #{rework.id} - {formatDate(rework.created_at)}
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Receipt Photo <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        required
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
                                                        value={formData.STATUS}
                                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                    >
                                                        {statuses.map(status => (
                                                            <option value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Source Information Display */}
                                            {formData.PO_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Purchase Order Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Vendor ID:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedPurchaseOrder()?.vendor_id || 'N/A'}
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
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Return ID:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedReturn()?.id}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Return Date:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedReturn()?.created_at ? formatDate(getSelectedReturn()!.created_at) : 'N/A'}
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
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Rework ID:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedRework()?.id}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Rework Date:</span>
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
                                        </div>

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
                                                                            Ordered: {item.QUANTITY_ORDERED} • Price: {formatCurrency(item.UNIT_PRICE)}
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
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                Unit Price: {formatCurrency(item.unit_price)}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                                                Item ID: {item.item_id}
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
                                                                                value={item.quantity}
                                                                                onChange={(e) => handleItemQuantityChange(item.item_id, parseInt(e.target.value) || 0)}
                                                                                className={`w-full px-3 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                                    errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-sidebar-border'
                                                                                }`}
                                                                            />
                                                                            {errors[`item_${index}_quantity`] && (
                                                                                <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                                                                            )}
                                                                            {formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE && (
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                    Ordered: {item.quantity} (reference only)
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                Total Value
                                                                            </label>
                                                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                                {formatCurrency(item.quantity * item.unit_price)}
                                                                            </p>
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
                                                            {getAvailableServices().map((service: Service) => (
                                                                <div key={service.id} className="flex justify-between items-center p-3 bg-white dark:bg-sidebar rounded border border-sidebar-border">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                            {service.description}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                            Rate: {formatCurrency(service.hourly_rate)}/hour
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
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                Service ID: {service.service_id}
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
                                                                                type="number"
                                                                                min="1"
                                                                                value={1}
                                                                                onChange={(e) => handleServiceQuantityChange(service.service_id, parseInt(e.target.value) || 0)}
                                                                                className={`w-full px-3 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                                    errors[`service_${index}_quantity`] ? 'border-red-500' : 'border-sidebar-border'
                                                                                }`}
                                                                            />
                                                                            {errors[`service_${index}_quantity`] && (
                                                                                <p className="text-red-500 text-xs mt-1">{errors[`service_${index}_quantity`]}</p>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                Total Value
                                                                            </label>
                                                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                                {formatCurrency(services.find(s => s.id === service.service_id)?.hourly_rate || 0)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Total Summary */}
                                        {(selectedItems.length > 0 || selectedServices.length > 0) && (
                                            <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Delivery Value:</span>
                                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(getTotalValue())}
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
