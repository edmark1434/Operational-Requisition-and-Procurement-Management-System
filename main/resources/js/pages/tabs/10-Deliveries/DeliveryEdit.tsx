import AppLayout from '@/layouts/app-layout';
import { delivery } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { getAvailablePurchaseOrders, getPurchaseOrderItems, transformDeliveriesData, formatDate, formatCurrency } from './utils';

// Import the new datasets
import returns from '../../datasets/returns';
import returnItems from '../../datasets/return_items';
import reworks from '../../datasets/reworks';

interface DeliveryEditProps {
    auth: any;
    deliveryId: number;
}

// Define proper types for delivery items and services
interface DeliveryItem {
    ITEM_ID: number;
    ITEM_NAME: string;
    QUANTITY: number;
    UNIT_PRICE: number;
    BARCODE?: string;
    MAX_QUANTITY?: number;
}

interface SelectedService {
    SERVICE_ID: number;
    SERVICE_NAME: string;
    DESCRIPTION: string;
    QUANTITY: number;
    UNIT_PRICE: number;
}

interface ServiceItem {
    SERVICE_ID: number;
    NAME: string;
    DESCRIPTION: string;
    QUANTITY: number;
    UNIT_PRICE: number;
}

interface AvailableService {
    SERVICE_ID: number;
    NAME: string;
    DESCRIPTION: string;
    QUANTITY: number;
    UNIT_PRICE: number;
    HOURLY_RATE?: number;
    VENDOR_ID?: number;
    CATEGORY_ID?: number;
    IS_ACTIVE?: boolean;
}

interface ReworkService {
    ID: number;
    SERVICE_ID: number;
    NAME: string;
    DESCRIPTION: string;
    QUANTITY: number;
    UNIT_PRICE: number;
}

interface Rework {
    ID: number;
    CREATED_AT: string;
    STATUS: string;
    REMARKS: string;
    PO_ID: number;
    SUPPLIER_NAME: string;
    SERVICES: ReworkService[];
}

interface ReturnItem {
    ID: number;
    RETURN_ID: number;
    ITEM_ID: number;
    QUANTITY: number;
    REASON: string;
}

interface Return {
    ID: number;
    CREATED_AT: string;
    RETURN_DATE: string;
    STATUS: string;
    REMARKS: string;
    DELIVERY_ID: number;
    SUPPLIER_NAME: string;
}

interface DeliveryData {
    ID: number;
    RECEIPT_NO: string;
    DELIVERY_DATE: string;
    TOTAL_COST: number;
    STATUS: string;
    REMARKS: string;
    RECEIPT_PHOTO: string;
    PO_ID: number;
    PO_REFERENCE: string;
    SUPPLIER_NAME?: string;
    DELIVERY_TYPE?: string;
    DELIVERY_ITEMS?: DeliveryItem[];
    ITEMS?: DeliveryItem[];
    SERVICES?: SelectedService[];
}

// Delivery type options
const DELIVERY_TYPES = {
    ITEM_PURCHASE: 'Item Purchase',
    SERVICE_DELIVERY: 'Service Delivery',
    ITEM_RETURN: 'Item Return',
    SERVICE_REWORK: 'Service Rework'
};

const breadcrumbs = (deliveryId: number): BreadcrumbItem[] => [
    {
        title: 'Deliveries',
        href: delivery().url,
    },
    {
        title: `Edit Delivery #${deliveryId}`,
        href: `/deliveries/${deliveryId}/edit`,
    },
];

export default function DeliveryEdit({ auth, deliveryId }: DeliveryEditProps) {
    const [formData, setFormData] = useState({
        DELIVERY_TYPE: '',
        PO_ID: '',
        RETURN_ID: '',
        REWORK_ID: '',
        RECEIPT_NO: '',
        DELIVERY_DATE: '',
        TOTAL_COST: '0',
        REMARKS: '',
        STATUS: 'pending',
        RECEIPT_PHOTO: ''
    });
    const [selectedItems, setSelectedItems] = useState<DeliveryItem[]>([]);
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [availableReturns, setAvailableReturns] = useState<Return[]>([]);
    const [availableReworks, setAvailableReworks] = useState<Rework[]>([]);
    const [currentDelivery, setCurrentDelivery] = useState<DeliveryData | null>(null);

    // Load delivery data on component mount
    useEffect(() => {
        loadDeliveryData();
        loadPurchaseOrders();
        loadReturns();
        loadReworks();
    }, [deliveryId]);

    // Auto-calculate total cost whenever selected items/services change
    useEffect(() => {
        const itemsTotal = selectedItems.reduce((total, item) => total + (item.QUANTITY * item.UNIT_PRICE), 0);
        const servicesTotal = selectedServices.reduce((total, service) => total + (service.QUANTITY * service.UNIT_PRICE), 0);
        const totalCost = itemsTotal + servicesTotal;
        setFormData(prev => ({ ...prev, TOTAL_COST: totalCost.toFixed(2) }));
    }, [selectedItems, selectedServices]);

    const loadPurchaseOrders = () => {
        try {
            const availablePOs = getAvailablePurchaseOrders();
            setPurchaseOrders(availablePOs);
        } catch (error) {
            console.error('Error loading purchase orders:', error);
            setPurchaseOrders([]);
        }
    };

    const loadReturns = () => {
        // Filter returns that are pending and available for delivery
        const pendingReturns = returns.filter((returnItem: Return) =>
            returnItem.STATUS === 'pending'
        );
        setAvailableReturns(pendingReturns);
    };

    const loadReworks = () => {
        // Filter reworks that are pending and available for delivery
        const pendingReworks = reworks.filter((rework: Rework) =>
            rework.STATUS === 'pending'
        );
        setAvailableReworks(pendingReworks);
    };

    const loadDeliveryData = () => {
        setIsLoading(true);

        try {
            const deliveries = transformDeliveriesData();
            const deliveryItem = deliveries.find(d => d.ID === deliveryId) as DeliveryData;

            if (!deliveryItem) {
                console.error(`Delivery #${deliveryId} not found`);
                alert('Delivery not found!');
                router.visit(delivery().url);
                return;
            }

            setCurrentDelivery(deliveryItem);

            // Format the date properly for the date input
            const deliveryDate = deliveryItem.DELIVERY_DATE.includes('T')
                ? deliveryItem.DELIVERY_DATE.split('T')[0]
                : deliveryItem.DELIVERY_DATE;

            setFormData({
                DELIVERY_TYPE: deliveryItem.DELIVERY_TYPE || DELIVERY_TYPES.ITEM_PURCHASE,
                PO_ID: deliveryItem.PO_ID?.toString() || '',
                RETURN_ID: '', // You'll need to determine these from the data based on delivery type
                REWORK_ID: '',
                RECEIPT_NO: deliveryItem.RECEIPT_NO,
                DELIVERY_DATE: deliveryDate,
                TOTAL_COST: deliveryItem.TOTAL_COST.toString(),
                REMARKS: deliveryItem.REMARKS || '',
                STATUS: deliveryItem.STATUS,
                RECEIPT_PHOTO: deliveryItem.RECEIPT_PHOTO || ''
            });

            // Handle items and services based on delivery type
            const deliveryItems = deliveryItem.DELIVERY_ITEMS || deliveryItem.ITEMS || [];

            if (deliveryItem.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY || deliveryItem.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_REWORK) {
                // Load services - you'll need to implement service loading logic based on your data structure
                const servicesWithDetails: SelectedService[] = deliveryItem.SERVICES?.map((service: any) => ({
                    SERVICE_ID: service.SERVICE_ID || service.ID,
                    SERVICE_NAME: service.SERVICE_NAME || service.NAME,
                    DESCRIPTION: service.DESCRIPTION || '',
                    QUANTITY: service.QUANTITY,
                    UNIT_PRICE: service.UNIT_PRICE
                })) || [];
                setSelectedServices(servicesWithDetails);
            } else {
                // Load items
                const itemsWithDetails: DeliveryItem[] = deliveryItems.map((item: any) => ({
                    ITEM_ID: item.ITEM_ID || item.ID,
                    ITEM_NAME: item.ITEM_NAME || item.NAME,
                    QUANTITY: item.QUANTITY,
                    UNIT_PRICE: item.UNIT_PRICE,
                    BARCODE: item.BARCODE || '',
                    MAX_QUANTITY: item.QUANTITY || item.MAX_QUANTITY
                }));
                setSelectedItems(itemsWithDetails);
            }
        } catch (error) {
            console.error('Error loading delivery data:', error);
            alert('Error loading delivery data!');
            router.visit(delivery().url);
        } finally {
            setIsLoading(false);
        }
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

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.DELIVERY_TYPE) {
            newErrors.DELIVERY_TYPE = 'Delivery type is required';
        }

        if (formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE || formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY) {
            if (!formData.PO_ID) {
                newErrors.PO_ID = 'Purchase order is required';
            }
        }

        if (formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_RETURN) {
            if (!formData.RETURN_ID) {
                newErrors.RETURN_ID = 'Return is required';
            }
        }

        if (formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_REWORK) {
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
            if (item.QUANTITY <= 0) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
            }
            if (item.MAX_QUANTITY && item.QUANTITY > item.MAX_QUANTITY) {
                newErrors[`item_${index}_quantity`] = `Quantity cannot exceed ${item.MAX_QUANTITY} (ordered quantity)`;
            }
        });

        selectedServices.forEach((service, index) => {
            if (service.QUANTITY <= 0) {
                newErrors[`service_${index}_quantity`] = 'Quantity must be greater than 0';
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
        const returnItem = availableReturns.find(r => r.ID === returnId);
        const items = returnItems.filter((ri: ReturnItem) => ri.RETURN_ID === returnId);

        const itemsWithDetails = items.map(item => ({
            ITEM_ID: item.ITEM_ID,
            ITEM_NAME: `Return Item #${item.ID}`,
            QUANTITY: item.QUANTITY,
            UNIT_PRICE: 0, // Returns typically don't have unit price
            BARCODE: '',
            MAX_QUANTITY: item.QUANTITY
        }));

        setSelectedItems(itemsWithDetails);
    };

    const loadReworkServices = (reworkId: number) => {
        const rework = availableReworks.find(r => r.ID === reworkId);
        if (rework && rework.SERVICES) {
            const servicesWithDetails = rework.SERVICES.map((service: ReworkService) => ({
                SERVICE_ID: service.SERVICE_ID,
                SERVICE_NAME: service.NAME,
                DESCRIPTION: service.DESCRIPTION,
                QUANTITY: service.QUANTITY,
                UNIT_PRICE: service.UNIT_PRICE
            }));
            setSelectedServices(servicesWithDetails);
        }
    };

    const handleAddItem = (item: any) => {
        const existingItem = selectedItems.find(selected => selected.ITEM_ID === item.ITEM_ID);

        if (!existingItem) {
            setSelectedItems(prev => [...prev, {
                ITEM_ID: item.ITEM_ID,
                ITEM_NAME: item.ITEM_NAME,
                QUANTITY: 1,
                UNIT_PRICE: item.UNIT_PRICE,
                BARCODE: item.BARCODE,
                MAX_QUANTITY: item.QUANTITY_ORDERED
            }]);
        }
    };

    const handleAddService = (service: any) => {
        const existingService = selectedServices.find(selected => selected.SERVICE_ID === service.SERVICE_ID);

        if (!existingService) {
            setSelectedServices(prev => [...prev, {
                SERVICE_ID: service.SERVICE_ID,
                SERVICE_NAME: service.NAME,
                DESCRIPTION: service.DESCRIPTION,
                QUANTITY: service.QUANTITY,
                UNIT_PRICE: service.UNIT_PRICE
            }]);
        }
    };

    const handleRemoveItem = (itemId: number) => {
        setSelectedItems(prev => prev.filter(item => item.ITEM_ID !== itemId));
    };

    const handleRemoveService = (serviceId: number) => {
        setSelectedServices(prev => prev.filter(service => service.SERVICE_ID !== serviceId));
    };

    const handleItemQuantityChange = (itemId: number, quantity: number) => {
        setSelectedItems(prev => prev.map(item =>
            item.ITEM_ID === itemId ? {
                ...item,
                QUANTITY: Math.min(Math.max(1, quantity), item.MAX_QUANTITY || quantity)
            } : item
        ));
    };

    const handleServiceQuantityChange = (serviceId: number, quantity: number) => {
        setSelectedServices(prev => prev.map(service =>
            service.SERVICE_ID === serviceId ? {
                ...service,
                QUANTITY: Math.max(1, quantity)
            } : service
        ));
    };

    const getTotalValue = () => {
        const itemsTotal = selectedItems.reduce((total, item) => total + (item.QUANTITY * item.UNIT_PRICE), 0);
        const servicesTotal = selectedServices.reduce((total, service) => total + (service.QUANTITY * service.UNIT_PRICE), 0);
        return itemsTotal + servicesTotal;
    };

    const getSelectedPurchaseOrder = () => {
        return purchaseOrders.find(po => po.ID.toString() === formData.PO_ID);
    };

    const getSelectedReturn = () => {
        return availableReturns.find(ret => ret.ID.toString() === formData.RETURN_ID);
    };

    const getSelectedRework = () => {
        return availableReworks.find(rework => rework.ID.toString() === formData.REWORK_ID);
    };

    const getAvailableItems = () => {
        if (!formData.PO_ID) return [];
        try {
            const poId = parseInt(formData.PO_ID);
            const items = getPurchaseOrderItems(poId);
            return items;
        } catch (error) {
            console.error('Error getting available items:', error);
            return [];
        }
    };

    const getAvailableServices = (): AvailableService[] => {
        if (!formData.PO_ID) return [];
        const selectedPO = getSelectedPurchaseOrder();
        return selectedPO?.SERVICES || [];
    };

    const getFilteredPurchaseOrders = () => {
        if (formData.DELIVERY_TYPE === DELIVERY_TYPES.ITEM_PURCHASE) {
            return purchaseOrders.filter(po =>
                po.ORDER_TYPE === 'items' &&
                (po.STATUS === 'approved' || po.STATUS === 'completed')
            );
        } else if (formData.DELIVERY_TYPE === DELIVERY_TYPES.SERVICE_DELIVERY) {
            return purchaseOrders.filter(po =>
                po.ORDER_TYPE === 'services' &&
                (po.STATUS === 'approved' || po.STATUS === 'completed')
            );
        }
        return [];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const calculatedTotalCost = parseFloat(formData.TOTAL_COST);

            const updatedDeliveryData = {
                ID: deliveryId,
                DELIVERY_TYPE: formData.DELIVERY_TYPE,
                DELIVERY_DATE: formData.DELIVERY_DATE,
                TOTAL_COST: calculatedTotalCost,
                RECEIPT_NO: formData.RECEIPT_NO,
                RECEIPT_PHOTO: formData.RECEIPT_PHOTO,
                STATUS: formData.STATUS,
                REMARKS: formData.REMARKS,
                PO_ID: formData.PO_ID ? parseInt(formData.PO_ID) : null,
                RETURN_ID: formData.RETURN_ID ? parseInt(formData.RETURN_ID) : null,
                REWORK_ID: formData.REWORK_ID ? parseInt(formData.REWORK_ID) : null,
                ITEMS: selectedItems.map(item => ({
                    ITEM_ID: item.ITEM_ID,
                    QUANTITY: item.QUANTITY,
                    UNIT_PRICE: item.UNIT_PRICE
                })),
                SERVICES: selectedServices.map(service => ({
                    SERVICE_ID: service.SERVICE_ID,
                    QUANTITY: service.QUANTITY,
                    UNIT_PRICE: service.UNIT_PRICE
                }))
            };

            console.log('Updated Delivery Data:', updatedDeliveryData);
            alert('Delivery updated successfully!');
            router.visit(delivery().url);
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

    const handleDelete = () => {
        console.log('Deleting delivery:', deliveryId);
        alert('Delivery deleted successfully!');
        setShowDeleteConfirm(false);
        router.visit(delivery().url);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(delivery().url);
        }
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(deliveryId)}>
                <Head title="Edit Delivery" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Delivery</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading delivery data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(deliveryId)}>
                <Head title="Edit Delivery" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Delivery</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing Delivery #{formData.RECEIPT_NO}
                            </p>
                        </div>
                        <Link
                            href={delivery().url}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Return to Deliveries
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                        <div className="h-full overflow-y-auto">
                            <div className="min-h-full flex items-start justify-center p-6">
                                <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                    {/* Header Section */}
                                    <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Edit Delivery #{formData.RECEIPT_NO}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update the delivery details below
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
                                                            <option value={DELIVERY_TYPES.ITEM_PURCHASE}>Item Purchase</option>
                                                            <option value={DELIVERY_TYPES.SERVICE_DELIVERY}>Service Delivery</option>
                                                            <option value={DELIVERY_TYPES.ITEM_RETURN}>Item Return</option>
                                                            <option value={DELIVERY_TYPES.SERVICE_REWORK}>Service Rework</option>
                                                        </select>
                                                        {errors.DELIVERY_TYPE && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.DELIVERY_TYPE}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Receipt Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={formData.RECEIPT_NO}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white font-mono cursor-not-allowed"
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Receipt number cannot be changed
                                                        </p>
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
                                                            Status
                                                        </label>
                                                        <select
                                                            value={formData.STATUS}
                                                            onChange={(e) => handleInputChange('STATUS', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="in-transit">In Transit</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Total Cost
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            readOnly
                                                            value={formData.TOTAL_COST}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white font-mono cursor-not-allowed"
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Automatically calculated from selected items/services
                                                        </p>
                                                    </div>
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
                                                                        <option key={po.ID} value={po.ID}>
                                                                            {po.REFERENCE_NO} - {po.SUPPLIER_NAME} - {formatCurrency(po.TOTAL_COST)}
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
                                                                        <option key={po.ID} value={po.ID}>
                                                                            {po.REFERENCE_NO} - {po.SUPPLIER_NAME} - {formatCurrency(po.TOTAL_COST)}
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
                                                                        <option key={ret.ID} value={ret.ID}>
                                                                            Return #{ret.ID} - {ret.SUPPLIER_NAME} - {formatDate(ret.CREATED_AT)}
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
                                                                        <option key={rework.ID} value={rework.ID}>
                                                                            Rework #{rework.ID} - {rework.SUPPLIER_NAME} - {formatDate(rework.CREATED_AT)}
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
                                                        {getSelectedPurchaseOrder() ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div>
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Supplier:</span>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {getSelectedPurchaseOrder()?.SUPPLIER_NAME}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Order Date:</span>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {getSelectedPurchaseOrder()?.CREATED_AT ? formatDate(getSelectedPurchaseOrder()!.CREATED_AT) : 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Payment Type:</span>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {getSelectedPurchaseOrder()?.PAYMENT_TYPE || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                                                Purchase order information not available. Please select a valid purchase order.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {formData.RETURN_ID && (
                                                    <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Return Information
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">Supplier:</span>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {getSelectedReturn()?.SUPPLIER_NAME}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">Return Date:</span>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {getSelectedReturn()?.CREATED_AT ? formatDate(getSelectedReturn()!.CREATED_AT) : 'N/A'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">Remarks:</span>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {getSelectedReturn()?.REMARKS}
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
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">Supplier:</span>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {getSelectedRework()?.SUPPLIER_NAME}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">Rework Date:</span>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {getSelectedRework()?.CREATED_AT ? formatDate(getSelectedRework()!.CREATED_AT) : 'N/A'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">Remarks:</span>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {getSelectedRework()?.REMARKS}
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
                                                                            disabled={selectedItems.some(selected => selected.ITEM_ID === item.ITEM_ID)}
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
                                                                    <div key={item.ITEM_ID} className="p-4">
                                                                        <div className="flex justify-between items-start mb-3">
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.ITEM_NAME}</p>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                    Unit Price: {formatCurrency(item.UNIT_PRICE)}
                                                                                </p>
                                                                                {item.BARCODE && (
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                                                        Barcode: {item.BARCODE}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveItem(item.ITEM_ID)}
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
                                                                                    max={item.MAX_QUANTITY}
                                                                                    value={item.QUANTITY}
                                                                                    onChange={(e) => handleItemQuantityChange(item.ITEM_ID, parseInt(e.target.value) || 0)}
                                                                                    className={`w-full px-3 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                                        errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-sidebar-border'
                                                                                    }`}
                                                                                />
                                                                                {errors[`item_${index}_quantity`] && (
                                                                                    <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                                                                                )}
                                                                                {item.MAX_QUANTITY && (
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                        Max: {item.MAX_QUANTITY}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Total Value
                                                                                </label>
                                                                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                                    {formatCurrency(item.QUANTITY * item.UNIT_PRICE)}
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
                                                                {getAvailableServices().map((service: AvailableService) => (
                                                                    <div key={service.SERVICE_ID} className="flex justify-between items-center p-3 bg-white dark:bg-sidebar rounded border border-sidebar-border">
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{service.NAME}</p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                {service.DESCRIPTION}
                                                                            </p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                Ordered: {service.QUANTITY} • Rate: {formatCurrency(service.UNIT_PRICE)}/hour
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAddService(service)}
                                                                            disabled={selectedServices.some(selected => selected.SERVICE_ID === service.SERVICE_ID)}
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
                                                                    <div key={service.SERVICE_ID} className="p-4">
                                                                        <div className="flex justify-between items-start mb-3">
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{service.SERVICE_NAME}</p>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                    {service.DESCRIPTION}
                                                                                </p>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                    Rate: {formatCurrency(service.UNIT_PRICE)}/hour
                                                                                </p>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveService(service.SERVICE_ID)}
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
                                                                                    value={service.QUANTITY}
                                                                                    onChange={(e) => handleServiceQuantityChange(service.SERVICE_ID, parseInt(e.target.value) || 0)}
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
                                                                                    {formatCurrency(service.QUANTITY * service.UNIT_PRICE)}
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
                                            <div className="flex justify-between items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Delivery
                                                </button>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete Delivery
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete delivery "{formData.RECEIPT_NO}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Delete Delivery
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
